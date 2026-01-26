import webview
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from timer import ThesisTimer
import time

JST = ZoneInfo("Asia/Tokyo")
class Api:
    def __init__(self):
        self.bachelor_timer = ThesisTimer(
            datetime(2026, 2, 10, 12, 0, tzinfo=JST)
        )
        self.master_timer = ThesisTimer(
            datetime(2026, 2, 2, 15, 0, tzinfo=JST)
        )

    def get_base_status(self, timemode):
        timer = self.bachelor_timer if timemode == "bachelor" else self.master_timer
        remaining = timer.remaining()

        return {
            "base_seconds": remaining.total_seconds(),
            "base_time": time.time(),
            "status": timer.status(),
            "overdue": timer.is_overdue(),
            "deadline": timer.deadline.isoformat()
        }

    def exit_app(self):
        print("Exiting application...")
        webview.windows[0].destroy()

def main():
    api = Api()

    webview.create_window(
        "EVA THESIS TIMER",
        "design/index.html",
        fullscreen=True,
        js_api=api
    )

    webview.start(debug=False)


if __name__ == "__main__":
    main()
