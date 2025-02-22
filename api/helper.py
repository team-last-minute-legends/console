from browser_use.browser.views import BrowserState
from browser_use.agent.views import AgentOutput


def base64_to_image(base64_string: str, output_filename: str):
    """Convert base64 string to image."""
    import base64
    import os

    if not os.path.exists(os.path.dirname(output_filename)):
        os.makedirs(os.path.dirname(output_filename))

    img_data = base64.b64decode(base64_string)
    with open(output_filename, "wb") as f:
        f.write(img_data)
    return output_filename


def new_step_callback(state: BrowserState, model_output: AgentOutput, steps: int):
    """capture screenshot."""
    path = f"./screenshots/{steps}.png"
    last_screenshot = state.screenshot

    img_path = base64_to_image(base64_string=str(last_screenshot), output_filename=path)
