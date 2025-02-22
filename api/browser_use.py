from os import system
from browser_use import Agent, Browser, BrowserConfig, Controller
from langchain_openai import ChatOpenAI
from pydantic import BaseModel


from api.helper import new_step_callback


llm = ChatOpenAI(model="gpt-4o")


class Items(BaseModel):
    title: str
    url: str
    price: int


controller = Controller(output_model=Items)


async def run_browser_use(query: str):
    browser = Browser(
        config=BrowserConfig(
            headless=True,
        )
    )

    agent = Agent(
        task=query,
        llm=llm,
        browser=browser,
        controller=controller,
        register_new_step_callback=new_step_callback,
    )

    try:
        history = await agent.run()
        result = history.final_result()
        return result
    except Exception as e:
        print(f"Error: {e}")
        result = str(e)
        return result
