from os import system
from typing import List
from browser_use import Agent, Browser, BrowserConfig, Controller
from langchain_openai import ChatOpenAI
from pydantic import BaseModel


from api.helper import new_step_callback


llm = ChatOpenAI(model="gpt-4o")


class Item(BaseModel):
    title: str
    url: str
    image: str
    price: int


class Posts(BaseModel):
    posts: List[Item]


controller = Controller(output_model=Posts)


async def run_browser_use(query: str):

    try:
        browser = Browser(
            config=BrowserConfig(
                headless=True,
            )
        )

        agent = Agent(
            task=query,
            llm=llm,
            max_actions_per_step=100,
            browser=browser,
            controller=controller,
            register_new_step_callback=new_step_callback,
        )
        history = await agent.run()
        result = history.final_result()
        return result
    except Exception as e:
        print(f"Error: {e}")
        result = str(e)
        return result
