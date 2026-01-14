from datetime import datetime, timezone, timedelta


class ThesisTimer:
    SAFE = "safe"
    WARN = "warn"
    DANGER = "danger"

    def __init__(
        self,
        deadline: datetime,
        warn_hours: float = 168.0,
        danger_hours: float = 72.0,
    ):
        self.deadline = deadline
        self.warn_hours = warn_hours
        self.danger_hours = danger_hours

    def remaining(self) -> timedelta:
        return self.deadline - datetime.now(timezone.utc)

    def remaining_seconds(self) -> float:
        return self.remaining().total_seconds()

    def remaining_hours(self) -> float:
        return self.remaining_seconds() / 3600.0

    def is_overdue(self) -> bool:
        return self.remaining_seconds() < 0

    def status(self) -> str:
        """
        Returns:
            "safe", "warn", or "danger"
        """
        if self.is_overdue():
            return self.DANGER

        hours = self.remaining_hours()

        if hours < self.danger_hours:
            return self.DANGER
        elif hours < self.warn_hours:
            return self.WARN
        else:
            return self.SAFE
