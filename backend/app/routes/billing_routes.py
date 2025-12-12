
from fastapi import APIRouter, Request, HTTPException, Depends
from ..config import settings
import stripe
from fastapi.responses import JSONResponse
from ..database import get_db
from ..models import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from ..auth import verify_token

router = APIRouter(prefix="/billing", tags=["billing"])
stripe.api_key = settings.STRIPE_SECRET_KEY
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)):
    token = credentials.credentials
    data = verify_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid token")
    q = await db.execute(select(User).filter_by(id=data.user_id))
    user = q.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/create-checkout-session")
async def create_checkout(payload: dict, user = Depends(get_current_user)):
    # Simple example: create a checkout session (sandbox)
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price_data":{"currency":"usd","product_data":{"name":"Pro plan"},"unit_amount":500},"quantity":1}],
            mode="payment",
            success_url=payload.get("success_url") or "https://example.com/success",
            cancel_url=payload.get("cancel_url") or "https://example.com/cancel",
            metadata={"user_id": user.id},
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        # If webhook secret not configured or verification fails, try simple parse (dev mode)
        try:
            event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)
        except Exception as e2:
            raise HTTPException(status_code=400, detail="Invalid payload")
    # Handle event types
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        # handle successful payment (update DB, grant access...)
        print("Checkout completed for user:", session.get("metadata", {}).get("user_id"))
    return JSONResponse({"status":"ok"})
