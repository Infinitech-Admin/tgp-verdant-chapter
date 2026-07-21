import { NextResponse } from "next/server";

export async function GET() {
  try {
    const locations = [
      {
        id: "1",
        name: "Las Piñas General Hospital and Satellite Trauma Center",
        category: "hospital",
        address: "Diego Cera Ave., Pulang Lupa I, Las Piñas City",
        phone: "(02) 8552-6608",
        lat: 14.4348,
        lng: 120.9914,
        icon: "hospital",
        hours: "24/7",
        services: ["Emergency", "Outpatient", "Laboratory"],
      },
      {
        id: "2",
        name: "Las Piñas City Police Station",
        category: "police",
        address: "Alabang-Zapote Road, Pamplona Tres, Las Piñas City",
        phone: "(02) 8871-3088",
        lat: 14.4508,
        lng: 120.9824,
        icon: "police",
        hours: "24/7",
        services: [
          "Emergency Response",
          "Crime Reporting",
          "Traffic Management",
        ],
      },
      {
        id: "3",
        name: "Las Piñas City Fire Station",
        category: "fire",
        address: "Alabang-Zapote Road, Las Piñas City",
        phone: "(02) 8871-3177",
        lat: 14.4497,
        lng: 120.9828,
        icon: "fire",
        hours: "24/7",
        services: [
          "Fire Response",
          "Rescue Operations",
          "Fire Safety Inspection",
        ],
      },
      {
        id: "4",
        name: "Las Piñas City Hall",
        category: "government",
        address: "Diego Cera Ave., Las Piñas City",
        phone: "(02) 8873-4000",
        lat: 14.4445,
        lng: 120.9933,
        icon: "government",
        hours: "Mon-Fri 8:00 AM - 5:00 PM",
        services: ["Business Permits", "Civil Registry", "City Planning"],
      },
      {
        id: "5",
        name: "Verdant Homes Las Piñas",
        category: "landmark",
        address: "Verdant Homes Subdivision, Las Piñas City",
        lat: 14.4215,
        lng: 121.0005,
        icon: "landmark",
        hours: "Open 24 Hours",
        services: ["Residential Community", "Clubhouse", "Parks"],
      },
      {
        id: "6",
        name: "SM Center Las Piñas",
        category: "landmark",
        address: "Alabang-Zapote Road, Las Piñas City",
        lat: 14.4503,
        lng: 120.982,
        icon: "landmark",
        hours: "Daily 10:00 AM - 9:00 PM",
        services: ["Shopping", "Dining", "Entertainment"],
      },
    ];

    return NextResponse.json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error("[v0] Error fetching locations:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch locations" },
      { status: 500 },
    );
  }
}
