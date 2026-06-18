from fastapi import APIRouter, Depends
from datetime import date
from deps import get_current_user, CurrentUser
from schemas import IncomeMonthlyResponse, IncomeBreakdownItem

router = APIRouter(prefix="/api/income", tags=["income"])


def _month_bounds(today: date):
    month_start = today.replace(day=1)
    if month_start.month == 12:
        next_month_start = month_start.replace(year=month_start.year + 1, month=1)
    else:
        next_month_start = month_start.replace(month=month_start.month + 1)
    return month_start, next_month_start


@router.get("/monthly", response_model=IncomeMonthlyResponse)
def get_monthly_income(user: CurrentUser = Depends(get_current_user)):
    today = date.today()
    month_start, next_month_start = _month_bounds(today)

    entries = (
        user.sb.table("time_entries")
        .select("project_id,hours")
        .gte("date", str(month_start))
        .lt("date", str(next_month_start))
        .execute()
        .data
    )

    hours_by_project: dict = {}
    for e in entries:
        hours_by_project[e["project_id"]] = hours_by_project.get(e["project_id"], 0.0) + float(e["hours"])

    projects = (
        user.sb.table("projects")
        .select("id,name,client_id,hourly_rate")
        .execute()
        .data
    )
    clients = user.sb.table("clients").select("id,name").execute().data
    client_names = {c["id"]: c["name"] for c in clients}

    breakdown = []
    total_hours = 0.0
    total_income = 0.0
    for p in projects:
        hours = hours_by_project.get(p["id"], 0.0)
        if hours <= 0:
            continue
        amount = hours * float(p["hourly_rate"])
        total_hours += hours
        total_income += amount
        breakdown.append({
            "project_id": p["id"],
            "project_name": p["name"],
            "client_id": p.get("client_id"),
            "client_name": client_names.get(p.get("client_id")),
            "hours": hours,
            "hourly_rate": float(p["hourly_rate"]),
            "amount": amount,
        })

    for item in breakdown:
        item["percentage"] = (item["amount"] / total_income * 100) if total_income > 0 else 0.0

    breakdown.sort(key=lambda item: item["amount"], reverse=True)

    return {
        "month": today.strftime("%Y-%m"),
        "total_hours": total_hours,
        "total_income": total_income,
        "breakdown": [IncomeBreakdownItem(**item) for item in breakdown],
    }
