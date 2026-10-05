from fastapi_app.database import SessionLocal
from fastapi_app.models import User, Location
from passlib.context import CryptContext


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


db = SessionLocal()


# ============================================================
# 1. CREATE MAINTENANCE USERS
# ============================================================

maintenance_users = [
    {
        "username": "maintenance_electrical",
        "email": "maintenance.electrical@campusfix.com",
        "specialization": "electrical",
    },
    {
        "username": "maintenance_plumbing",
        "email": "maintenance.plumbing@campusfix.com",
        "specialization": "plumbing",
    },
    {
        "username": "maintenance_cleaning",
        "email": "maintenance.cleaning@campusfix.com",
        "specialization": "cleaning",
    },
    {
        "username": "maintenance_wifi",
        "email": "maintenance.wifi@campusfix.com",
        "specialization": "wifi_it",
    },
    {
        "username": "maintenance_classroom",
        "email": "maintenance.classroom@campusfix.com",
        "specialization": "classroom_equipment",
    },
    {
        "username": "maintenance_security",
        "email": "maintenance.security@campusfix.com",
        "specialization": "security",
    },
    {
        "username": "maintenance_other",
        "email": "maintenance.other@campusfix.com",
        "specialization": "other",
    },
]


TEMP_PASSWORD = "CampusFix@123"


for data in maintenance_users:

    existing_user = (
        db.query(User)
        .filter(User.username == data["username"])
        .first()
    )

    if existing_user:

        print(
            f"Maintenance user already exists: "
            f"{data['username']}"
        )

        continue


    user = User(
        username=data["username"],
        email=data["email"],
        password=pwd_context.hash(TEMP_PASSWORD),
        role="maintenance",
        specialization=data["specialization"],
        is_active=True,
    )

    db.add(user)

    print(
        f"Created maintenance user: "
        f"{data['username']}"
    )


db.commit()


# ============================================================
# 2. CREATE LOCATIONS
# ============================================================

locations = []


# ----------------------------
# Floor 1
# ----------------------------

for room_number in range(1, 6):

    locations.append({
        "block": "Main Block",
        "building": "Floor 1",
        "room": f"Classroom 10{room_number}",
        "area": "Classroom",
    })


for lab_number in range(1, 6):

    locations.append({
        "block": "Main Block",
        "building": "Floor 1",
        "room": f"Lab 10{lab_number}",
        "area": "Laboratory",
    })


locations.append({
    "block": "Main Block",
    "building": "Floor 1",
    "room": "Staff Room",
    "area": "Staff Room",
})


locations.append({
    "block": "Main Block",
    "building": "Floor 1",
    "room": "Management Room",
    "area": "Management Room",
})


# ----------------------------
# Floor 2
# ----------------------------

for room_number in range(1, 6):

    locations.append({
        "block": "Main Block",
        "building": "Floor 2",
        "room": f"Classroom 20{room_number}",
        "area": "Classroom",
    })


for lab_number in range(1, 6):

    locations.append({
        "block": "Main Block",
        "building": "Floor 2",
        "room": f"Lab 20{lab_number}",
        "area": "Laboratory",
    })


locations.append({
    "block": "Main Block",
    "building": "Floor 2",
    "room": "Staff Room",
    "area": "Staff Room",
})


locations.append({
    "block": "Main Block",
    "building": "Floor 2",
    "room": "Management Room",
    "area": "Management Room",
})


# ----------------------------
# Floor 3
# ----------------------------

for room_number in range(1, 11):

    locations.append({
        "block": "Main Block",
        "building": "Floor 3",
        "room": f"Classroom 30{room_number}",
        "area": "Classroom",
    })


locations.append({
    "block": "Main Block",
    "building": "Floor 3",
    "room": "Staff Room",
    "area": "Staff Room",
})


locations.append({
    "block": "Main Block",
    "building": "Floor 3",
    "room": "Management Room",
    "area": "Management Room",
})


# ----------------------------
# Floor 4
# ----------------------------

for room_number in range(1, 11):

    locations.append({
        "block": "Main Block",
        "building": "Floor 4",
        "room": f"Classroom 40{room_number}",
        "area": "Classroom",
    })


locations.append({
    "block": "Main Block",
    "building": "Floor 4",
    "room": "Staff Room",
    "area": "Staff Room",
})


locations.append({
    "block": "Main Block",
    "building": "Floor 4",
    "room": "Management Room",
    "area": "Management Room",
})


# ============================================================
# INSERT LOCATIONS
# ============================================================

for data in locations:

    existing_location = (
        db.query(Location)
        .filter(
            Location.block == data["block"],
            Location.building == data["building"],
            Location.room == data["room"],
        )
        .first()
    )

    if existing_location:

        print(
            f"Location already exists: "
            f"{data['building']} - {data['room']}"
        )

        continue


    location = Location(
        block=data["block"],
        building=data["building"],
        room=data["room"],
        area=data["area"],
    )

    db.add(location)

    print(
        f"Created location: "
        f"{data['building']} - {data['room']}"
    )


db.commit()

db.close()


print()
print("======================================")
print("Campus Fix seed completed successfully")
print("======================================")
print()
print("Maintenance users:")
print("------------------")

for user in maintenance_users:
    print(
        f"{user['username']} "
        f"-> {user['specialization']}"
    )

print()
print(f"Temporary password: {TEMP_PASSWORD}")
print()
print(f"Locations processed: {len(locations)}")