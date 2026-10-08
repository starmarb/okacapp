# okac/api.py  (new file)
from appointments.api import router as appointments_router
from inventory.api import router as inventory_router
from ninja import NinjaAPI

api = NinjaAPI(title="Okac API", version="1.0.0")

api.add_router("/appointments/", appointments_router)
api.add_router("/inventory/", inventory_router)
