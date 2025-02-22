import asyncio
import os
import json
import sys
import time
import uuid
from typing import Any, Dict, List
from datetime import datetime
from browser_use import Agent
from elevenlabs import ElevenLabs
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from openai import OpenAI
from openai.types.chat import ChatCompletionMessageParam
from api.browser_use import run_browser_use
from api.crew import LatestAiDevelopmentCrew, run
from .utils.prompt import ClientMessage, convert_to_openai_messages
from .utils.tools import get_current_weather
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from concurrent.futures import TimeoutError as ConnectionTimeoutError
from fastapi.responses import JSONResponse

from rich.console import Console
import websockets


load_dotenv()

app = FastAPI()
console = Console()

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)


class Request(BaseModel):
    messages: List[ClientMessage]


async def dummy_run_browser_use(query):
    # Basic error handling and query validation
    if not query or len(query.strip()) == 0:
        return {"error": "Search query cannot be empty", "posts": []}

    try:
        # Simulate different responses based on the query
        if "white kurta" in query.lower():
            return {
                "posts": [
                    {
                        "title": "Jompers Men White Kurtas Embroidered ",
                        "image": "https://assets.myntassets.com/dpr_2,q_60,w_210,c_limit,fl_progressive/assets/images/19031226/2023/1/20/ed56f113-3289-4da3-a334-a4d7d46af0ea1674212798329JompersMenWhiteEmbroideredKurtas1.jpg",
                        "url": "https://www.myntra.com/kurtas/jompers/jompers-men-white-embroidered-kurtas/19031226/buy",
                        "price": "758Rs",
                    },
                    {
                        "title": "Jompers Men White Embroidered Kurtas",
                        "image": "https://assets.myntassets.com/dpr_2,q_60,w_210,c_limit,fl_progressive/assets/images/19031226/2023/1/20/ed56f113-3289-4da3-a334-a4d7d46af0ea1674212798329JompersMenWhiteEmbroideredKurtas1.jpg",
                        "url": "https://www.myntra.com/kurtas/jompers/jompers-men-white-embroidered-kurtas/19031226/buy",
                        "price": "758Rs",
                    },
                    {
                        "title": "Jompers Men White Embroidered Kurtas",
                        "image": "https://assets.myntassets.com/dpr_2,q_60,w_210,c_limit,fl_progressive/assets/images/19031226/2023/1/20/ed56f113-3289-4da3-a334-a4d7d46af0ea1674212798329JompersMenWhiteEmbroideredKurtas1.jpg",
                        "url": "https://www.myntra.com/kurtas/jompers/jompers-men-white-embroidered-kurtas/19031226/buy",
                        "price": "758Rs",
                    },
                    {
                        "title": "Jompers Men White Embroidered Kurtas",
                        "image": "https://assets.myntassets.com/dpr_2,q_60,w_210,c_limit,fl_progressive/assets/images/19031226/2023/1/20/ed56f113-3289-4da3-a334-a4d7d46af0ea1674212798329JompersMenWhiteEmbroideredKurtas1.jpg",
                        "url": "https://www.myntra.com/kurtas/jompers/jompers-men-white-embroidered-kurtas/19031226/buy",
                        "price": "758Rs",
                    },
                ]
            }
        else:
            # Default response with actual search query context
            return {"message": f"No results found for '{query}'", "posts": []}
    except Exception as e:
        return {"error": f"Error processing search: {str(e)}", "posts": []}


# Available tools mapping
available_tools = {
    "get_current_weather": get_current_weather,
    "browser_search": run_browser_use,
}

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get current temperature for a given location.",
            "parameters": {
                "type": "object",
                "properties": {
                    "latitude": {
                        "type": "number",
                        "description": "The latitude of the location",
                    },
                    "longitude": {
                        "type": "number",
                        "description": "The longitude of the location",
                    },
                },
                "required": ["latitude", "longitude"],
                "additionalProperties": False,
            },
            "strict": True,
        },
    },
    {
        "type": "function",
        "function": {
            "name": "browser_search",
            "description": "Search the web for information",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query",
                    },
                },
                "required": ["query"],
                "additionalProperties": False,
            },
            "strict": True,
        },
    },
]


async def stream_text(
    messages: List[ChatCompletionMessageParam], protocol: str = "data"
):
    draft_tool_calls = []
    draft_tool_calls_index = -1

    stream = client.chat.completions.create(
        messages=messages,
        model="gpt-4o",
        stream=True,
        tools=tools,
    )

    for chunk in stream:
        for choice in chunk.choices:
            if choice.finish_reason == "stop":
                continue

            elif choice.finish_reason == "tool_calls":
                for tool_call in draft_tool_calls:
                    yield '9:{{"toolCallId":"{id}","toolName":"{name}","args":{args}}}\n'.format(
                        id=tool_call["id"],
                        name=tool_call["name"],
                        args=tool_call["arguments"],
                    )

                for tool_call in draft_tool_calls:
                    tool_result = await available_tools[tool_call["name"]](
                        **json.loads(tool_call["arguments"])
                    )
                    yield 'a:{{"toolCallId":"{id}","toolName":"{name}","args":{args},"result":{result}}}\n'.format(
                        id=tool_call["id"],
                        name=tool_call["name"],
                        args=tool_call["arguments"],
                        result=json.dumps(tool_result),
                    )

            elif choice.delta.tool_calls:
                for tool_call in choice.delta.tool_calls:
                    id = tool_call.id
                    name = tool_call.function.name
                    arguments = tool_call.function.arguments

                    if id is not None:
                        draft_tool_calls_index += 1
                        draft_tool_calls.append(
                            {"id": id, "name": name, "arguments": ""}
                        )

                    else:
                        draft_tool_calls[draft_tool_calls_index][
                            "arguments"
                        ] += arguments

            else:
                yield "0:{text}\n".format(text=json.dumps(choice.delta.content))

        if chunk.choices == []:
            usage = chunk.usage
            prompt_tokens = usage.prompt_tokens
            completion_tokens = usage.completion_tokens

            yield 'e:{{"finishReason":"{reason}","usage":{{"promptTokens":{prompt},"completionTokens":{completion}}},"isContinued":false}}\n'.format(
                reason="tool-calls" if len(draft_tool_calls) > 0 else "stop",
                prompt=prompt_tokens,
                completion=completion_tokens,
            )


@app.post("/api/chat")
async def handle_chat_data(request: Request, protocol: str = Query("data")):
    messages = request.messages
    openai_messages = convert_to_openai_messages(messages)

    response = StreamingResponse(stream_text(openai_messages, protocol))
    response.headers["x-vercel-ai-data-stream"] = "v1"
    return response


@app.websocket("/v1/convai/conversation?agent_id={agent_name}")
async def handle_voice_stream(websocket: WebSocket, agent_name: str):
    await websocket.accept()
    ws_url = f"wss://api.elevenlabs.io/v1/convai/conversation?agent_id={agent_name}"

    try:
        async with websockets.connect(ws_url) as elevenlabs_ws:

            async def forward_messages():
                """Receive messages from the user WebSocket and forward them to Eleven Labs"""
                while True:
                    try:
                        pass
                        # TODO: Need to think how to deal with it
                        message = await websocket.recv()
                        await elevenlabs_ws.send(message)
                    except WebSocketDisconnect:
                        print(f"WebSocket disconnected for agent: {agent_name}")
                        break
                    except Exception as e:
                        print(f"Error forwarding message: {e}")
                        break

            async def receive_messages():
                """Receive messages from Eleven Labs and send them back to the user"""
                while True:
                    try:
                        response = await elevenlabs_ws.recv()
                        await websocket.send_text(response)
                    except websockets.exceptions.ConnectionClosed:
                        print("Eleven Labs WebSocket closed")
                        break
                    except Exception as e:
                        print(f"Error receiving message: {e}")
                        break

            # Run both tasks concurrently
            await asyncio.gather(forward_messages(), receive_messages())
    except websockets.exceptions.WebSocketException as e:
        print(f"Error with Eleven Labs WebSocket connection: {e}")
    finally:
        await websocket.close()


async def chat_stream(messages):
    query_prompt = messages[-1].content
    print(f"prompt: {query_prompt}")
    result = run(query_prompt)

    formatted_response = str(result)
    chunk_id = f"chatcmpl-{uuid.uuid4().hex}"

    lines = formatted_response.split("\n")

    for i, line in enumerate(lines):
        chunk = {
            "id": chunk_id,
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "choices": [
                {
                    "index": 0,
                    "delta": {"content": line + "\n"},
                    "finish_reason": None,
                }
            ],
        }
        yield f"{json.dumps(chunk)}\n"
        await asyncio.sleep(0.5)

    final_chunk = {
        "id": chunk_id,
        "object": "chat.completion.chunk",
        "created": int(time.time()),
        "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
    }
    yield f"{json.dumps(final_chunk)}\n"


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


@app.post("/api/crews")
async def chat(request: ChatRequest):
    response = StreamingResponse(
        chat_stream(request.messages), media_type="text/event-stream"
    )
    response.headers["x-vercel-ai-data-stream"] = "v1"
    return response


class BrowseruseRequest(BaseModel):
    query: str


@app.post("/api/browseruse")
async def browseruse(request: BrowseruseRequest):
    try:
        print(f"request.query: {request.query}")
        result = await run_browser_use(request.query)
        converted_agent_data = json.loads(result)
        return {"result": converted_agent_data}

    except Exception as e:
        print(f"Error: {e}")
        return {"result": None}
