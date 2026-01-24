// lib/business-verticals.ts
// Configuration for all business vertical landing pages

export interface BusinessVertical {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroDescription: string;
  useCases: {
    title: string;
    description: string;
    icon: string; // Tabler icon name
  }[];
  batchPatternSuggestions: {
    pattern: string;
    example: string;
  }[];
  recommendedPlan: "explorer" | "creator" | "champion";
  recommendedPlanReason: string;
  photoSuggestions: {
    hero: string;
    useCases?: string;
    cta?: string;
  };
  stats?: {
    label: string;
    value: string;
  }[];
}

export const businessVerticals: Record<string, BusinessVertical> = {
  restaurants: {
    slug: "restaurants",
    name: "Restaurants",
    tagline: "Modernize Your Dining Experience",
    description: "Digital menus, table ordering, and instant feedback collection",
    heroDescription:
      "Transform your restaurant with QR codes on every table. Let diners view menus, place orders, and share feedback - all from their phones.",
    useCases: [
      {
        title: "Table Ordering",
        description:
          "Place unique QR codes on each table linking to your digital menu or ordering system. Update menu items instantly without reprinting.",
        icon: "IconToolsKitchen2",
      },
      {
        title: "Digital Menus",
        description:
          "Display your full menu with photos, descriptions, allergen info, and daily specials. Update prices in real-time.",
        icon: "IconBook",
      },
      {
        title: "Customer Feedback",
        description:
          "Collect reviews and feedback before customers leave. Address issues immediately and boost your online ratings.",
        icon: "IconMessageStar",
      },
      {
        title: "WiFi Access",
        description:
          "Share your WiFi credentials instantly. No more writing passwords on napkins or shouting across the room.",
        icon: "IconWifi",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Table {n}", example: "Table 1, Table 2, Table 3..." },
      { pattern: "Table #{n}", example: "Table #1, Table #2, Table #3..." },
      { pattern: "Booth {n}", example: "Booth 1, Booth 2, Booth 3..." },
      { pattern: "Patio {n}", example: "Patio 1, Patio 2, Patio 3..." },
    ],
    recommendedPlan: "creator",
    recommendedPlanReason:
      "Most restaurants have 15-40 tables. Creator gives you 50 dynamic QR codes with analytics to track which tables are most active.",
    photoSuggestions: {
      hero: "PHOTO: Modern restaurant interior with QR code tent cards on tables. Warm lighting, contemporary decor. Customers scanning codes with phones.",
      useCases:
        "PHOTO: Close-up of a phone displaying a beautiful digital menu with food photos.",
      cta: "PHOTO: Happy restaurant owner/manager holding tablet showing analytics dashboard.",
    },
    stats: [
      { label: "Faster table turnover", value: "23%" },
      { label: "Menu printing costs saved", value: "$2,400/yr" },
      { label: "More online reviews", value: "3x" },
    ],
  },

  cafes: {
    slug: "cafes",
    name: "Cafes & Coffee Shops",
    tagline: "Brew Up a Better Customer Experience",
    description: "Streamlined ordering, loyalty programs, and WiFi sharing",
    heroDescription:
      "From counter menus to table tents, QR codes help your cafe run smoother. Customers order faster, join loyalty programs instantly, and connect to WiFi without asking.",
    useCases: [
      {
        title: "Counter Menus",
        description:
          "Display your full drink and food menu at the counter. Customers browse while waiting in line.",
        icon: "IconCoffee",
      },
      {
        title: "Loyalty Programs",
        description:
          "Link directly to your loyalty app or sign-up page. Turn first-time visitors into regulars.",
        icon: "IconHeart",
      },
      {
        title: "Mobile Ordering",
        description:
          "Let customers order ahead or from their seat. Reduce wait times during rush hours.",
        icon: "IconDeviceMobile",
      },
      {
        title: "Social Media",
        description:
          "Grow your following with QR codes linking to your Instagram, TikTok, or review pages.",
        icon: "IconBrandInstagram",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Table {n}", example: "Table 1, Table 2, Table 3..." },
      { pattern: "Seat {n}", example: "Seat 1, Seat 2, Seat 3..." },
      { pattern: "Window {n}", example: "Window 1, Window 2, Window 3..." },
    ],
    recommendedPlan: "explorer",
    recommendedPlanReason:
      "Most cafes need 5-15 QR codes. Explorer gives you 10 dynamic codes with enough flexibility to grow.",
    photoSuggestions: {
      hero: "PHOTO: Cozy cafe interior with exposed brick, customers working on laptops. QR code displays on tables and counter.",
      useCases: "PHOTO: Barista preparing latte art, QR code menu visible on counter.",
      cta: "PHOTO: Group of friends at cafe table, one scanning QR code with phone.",
    },
    stats: [
      { label: "Loyalty sign-ups increase", value: "40%" },
      { label: "Average order value up", value: "15%" },
      { label: "Staff questions reduced", value: "60%" },
    ],
  },

  "food-trucks": {
    slug: "food-trucks",
    name: "Food Trucks",
    tagline: "Take Orders Without the Line",
    description: "Mobile menus, quick payments, and location sharing",
    heroDescription:
      "Your menu changes daily. Your location changes hourly. QR codes keep your customers in the loop wherever you park.",
    useCases: [
      {
        title: "Dynamic Menus",
        description:
          "Update your menu instantly when you sell out or add specials. No reprinting needed.",
        icon: "IconMenuOrder",
      },
      {
        title: "Mobile Payments",
        description:
          "Link to Venmo, Cash App, or your payment processor. Speed up transactions.",
        icon: "IconCreditCard",
      },
      {
        title: "Location Updates",
        description:
          "Share your current location or weekly schedule. Customers always know where to find you.",
        icon: "IconMapPin",
      },
      {
        title: "Social Following",
        description:
          "Build your social media presence with easy-to-scan follow links.",
        icon: "IconShare",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Truck {n}", example: "Truck 1, Truck 2, Truck 3..." },
      { pattern: "{location}", example: "Downtown, Beach, Market..." },
      { pattern: "Window {n}", example: "Window 1, Window 2..." },
    ],
    recommendedPlan: "explorer",
    recommendedPlanReason:
      "Food trucks typically need just 3-5 QR codes. Explorer gives you room to grow with 10 dynamic codes.",
    photoSuggestions: {
      hero: "PHOTO: Colorful food truck at outdoor event, customers lined up, QR code displayed on service window.",
      useCases:
        "PHOTO: Close-up of food truck menu board with QR code, street food being served.",
      cta: "PHOTO: Food truck owner smiling, handing food to customer.",
    },
    stats: [
      { label: "Line wait time reduced", value: "35%" },
      { label: "Payment processing faster", value: "50%" },
      { label: "Social followers gained", value: "+200/mo" },
    ],
  },

  hotels: {
    slug: "hotels",
    name: "Hotels",
    tagline: "Elevate Every Guest Interaction",
    description: "Room service, amenity info, and contactless check-in",
    heroDescription:
      "From the lobby to every room, QR codes help guests access information instantly. Room service menus, spa bookings, local recommendations - all at their fingertips.",
    useCases: [
      {
        title: "Room Information",
        description:
          "Replace paper directories with dynamic QR codes. Update room service menus, checkout times, and amenity info instantly.",
        icon: "IconBed",
      },
      {
        title: "Contactless Check-in",
        description:
          "Streamline arrivals with digital check-in. Guests go straight to their rooms.",
        icon: "IconDoorEnter",
      },
      {
        title: "Amenity Booking",
        description:
          "Spa appointments, restaurant reservations, and gym access - all bookable via QR code.",
        icon: "IconCalendarEvent",
      },
      {
        title: "Local Guides",
        description:
          "Share curated local recommendations. Restaurants, attractions, and hidden gems.",
        icon: "IconMap",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Room {n}", example: "Room 101, Room 102, Room 103..." },
      { pattern: "Suite {n}", example: "Suite 1, Suite 2, Suite 3..." },
      { pattern: "Floor {n}", example: "Floor 1, Floor 2, Floor 3..." },
      { pattern: "{floor}{room}", example: "101, 102, 201, 202..." },
    ],
    recommendedPlan: "champion",
    recommendedPlanReason:
      "Hotels typically need 50-200+ room codes plus common areas. Champion gives you 250 dynamic QR codes with priority support.",
    photoSuggestions: {
      hero: "PHOTO: Luxurious hotel room with modern decor, QR code tent card on nightstand, city view through window.",
      useCases:
        "PHOTO: Hotel guest scanning QR code in elegant lobby, concierge desk in background.",
      cta: "PHOTO: Hotel staff member with tablet, smiling at camera, lobby setting.",
    },
    stats: [
      { label: "Front desk calls reduced", value: "45%" },
      { label: "Guest satisfaction up", value: "18%" },
      { label: "Printing costs saved", value: "$8,000/yr" },
    ],
  },

  "vacation-rentals": {
    slug: "vacation-rentals",
    name: "Vacation Rentals",
    tagline: "Be the Perfect Host, Even Remotely",
    description: "Property guides, house rules, and local tips",
    heroDescription:
      "Can't be there in person? QR codes let you provide five-star hospitality from anywhere. Guests get instant access to everything they need.",
    useCases: [
      {
        title: "Property Guides",
        description:
          "How-to guides for appliances, thermostats, entertainment systems. No more confused calls at midnight.",
        icon: "IconHome",
      },
      {
        title: "House Rules",
        description:
          "Checkout procedures, quiet hours, trash collection - all in one scannable place.",
        icon: "IconClipboardList",
      },
      {
        title: "Local Recommendations",
        description:
          "Share your favorite restaurants, beaches, hikes, and hidden gems like a local.",
        icon: "IconMapPin",
      },
      {
        title: "Emergency Info",
        description:
          "Hospital locations, emergency contacts, property manager details - always accessible.",
        icon: "IconFirstAidKit",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Property {n}", example: "Property 1, Property 2..." },
      { pattern: "{property-name}", example: "Beach House, Mountain Cabin..." },
      { pattern: "Unit {n}", example: "Unit A, Unit B, Unit C..." },
    ],
    recommendedPlan: "explorer",
    recommendedPlanReason:
      "Most vacation rental hosts have 1-5 properties. Explorer's 10 codes give you flexibility for multiple info points per property.",
    photoSuggestions: {
      hero: "PHOTO: Beautiful vacation rental living room, welcome basket with QR code card, beach/mountain view through window.",
      useCases:
        "PHOTO: Guest arriving at vacation home, scanning QR code on welcome sign.",
      cta: "PHOTO: Happy family on vacation rental patio, enjoying sunset.",
    },
    stats: [
      { label: "Guest questions reduced", value: "70%" },
      { label: "5-star reviews increase", value: "25%" },
      { label: "Check-in time saved", value: "15 min" },
    ],
  },

  "tour-operators": {
    slug: "tour-operators",
    name: "Tour Operators",
    tagline: "Guide Smarter, Not Harder",
    description: "Tour info, audio guides, and booking management",
    heroDescription:
      "Give every tourist a personal guide in their pocket. QR codes deliver tour information, audio commentary, and booking details instantly in any language.",
    useCases: [
      {
        title: "Audio Guides",
        description:
          "Self-paced audio tours in multiple languages. Guests explore at their own speed.",
        icon: "IconHeadphones",
      },
      {
        title: "Tour Information",
        description:
          "Itineraries, meeting points, what to bring - all accessible before and during the tour.",
        icon: "IconRoute",
      },
      {
        title: "Booking & Tickets",
        description:
          "Link to booking pages, digital tickets, and tour upgrades.",
        icon: "IconTicket",
      },
      {
        title: "Safety Information",
        description:
          "Emergency procedures, contact numbers, and safety guidelines always accessible.",
        icon: "IconShield",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Stop {n}", example: "Stop 1, Stop 2, Stop 3..." },
      { pattern: "Tour {n}", example: "Tour A, Tour B, Tour C..." },
      { pattern: "Point {n}", example: "Point 1, Point 2, Point 3..." },
      { pattern: "{landmark}", example: "Castle, Bridge, Square..." },
    ],
    recommendedPlan: "creator",
    recommendedPlanReason:
      "Tours typically have 10-30 stops or points of interest. Creator gives you 50 dynamic codes plus audio upload support.",
    photoSuggestions: {
      hero: "PHOTO: Tour group at scenic viewpoint, guide pointing at landmark, tourists scanning QR code on information plaque.",
      useCases:
        "PHOTO: Tourist with headphones listening to audio guide, historic building in background.",
      cta: "PHOTO: Enthusiastic tour guide with small group, beautiful destination setting.",
    },
    stats: [
      { label: "Guide workload reduced", value: "40%" },
      { label: "Guest engagement up", value: "55%" },
      { label: "Languages supported", value: "10+" },
    ],
  },

  "museums-galleries": {
    slug: "museums-galleries",
    name: "Museums & Galleries",
    tagline: "Bring Every Exhibit to Life",
    description: "Exhibit info, audio guides, and interactive experiences",
    heroDescription:
      "Transform static displays into interactive experiences. Visitors scan to learn more, hear artist commentary, and engage deeper with your collection.",
    useCases: [
      {
        title: "Exhibit Information",
        description:
          "Extended descriptions, artist bios, historical context - more than a placard can hold.",
        icon: "IconFrame",
      },
      {
        title: "Audio Commentary",
        description:
          "Artist interviews, curator insights, and detailed explanations in any language.",
        icon: "IconVolume",
      },
      {
        title: "Interactive Content",
        description:
          "Videos, 360° views, related works, and behind-the-scenes content.",
        icon: "IconPlayerPlay",
      },
      {
        title: "Gift Shop Links",
        description:
          "Link to prints, books, and merchandise related to each exhibit.",
        icon: "IconShoppingBag",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Exhibit {n}", example: "Exhibit 1, Exhibit 2, Exhibit 3..." },
      { pattern: "Gallery {n}", example: "Gallery A, Gallery B, Gallery C..." },
      { pattern: "Piece {n}", example: "Piece 1, Piece 2, Piece 3..." },
      { pattern: "{artwork-name}", example: "Starry Night, Mona Lisa..." },
    ],
    recommendedPlan: "champion",
    recommendedPlanReason:
      "Museums often have 100+ exhibits. Champion gives you 250 dynamic codes, audio uploads, and the storage you need.",
    photoSuggestions: {
      hero: "PHOTO: Elegant museum gallery with visitors, someone scanning QR code next to painting, beautiful artwork on walls.",
      useCases:
        "PHOTO: Close-up of museum placard with QR code, blurred sculpture in background.",
      cta: "PHOTO: Diverse group of visitors engaged with exhibit, modern museum interior.",
    },
    stats: [
      { label: "Visitor engagement up", value: "65%" },
      { label: "Audio guide adoption", value: "80%" },
      { label: "Gift shop revenue up", value: "22%" },
    ],
  },

  "tourist-attractions": {
    slug: "tourist-attractions",
    name: "Tourist Attractions",
    tagline: "Enhance Every Visit",
    description: "Information points, tickets, and visitor guides",
    heroDescription:
      "Historic sites, theme parks, landmarks - wherever visitors gather, QR codes deliver the information they're looking for.",
    useCases: [
      {
        title: "Information Points",
        description:
          "Detailed history, fun facts, and photo opportunities at every stop.",
        icon: "IconInfoCircle",
      },
      {
        title: "Ticketing",
        description:
          "Skip-the-line tickets, upgrades, and special experience bookings.",
        icon: "IconTicket",
      },
      {
        title: "Wayfinding",
        description:
          "Interactive maps, suggested routes, and accessibility information.",
        icon: "IconMap",
      },
      {
        title: "Visitor Services",
        description:
          "Restrooms, dining, first aid, and guest services locations.",
        icon: "IconBuildingCommunity",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Point {n}", example: "Point 1, Point 2, Point 3..." },
      { pattern: "Zone {n}", example: "Zone A, Zone B, Zone C..." },
      { pattern: "Attraction {n}", example: "Attraction 1, Attraction 2..." },
      { pattern: "{location}", example: "Entrance, Tower, Garden..." },
    ],
    recommendedPlan: "champion",
    recommendedPlanReason:
      "Large attractions need codes at dozens of locations. Champion's 250 codes and priority support keep you covered.",
    photoSuggestions: {
      hero: "PHOTO: Iconic tourist destination (landmark, theme park, historic site), visitors enjoying, QR codes visible on signs.",
      useCases:
        "PHOTO: Family reading information from phone after scanning QR code at attraction.",
      cta: "PHOTO: Sunset at famous landmark, tourists taking photos.",
    },
    stats: [
      { label: "Visitor satisfaction up", value: "30%" },
      { label: "Staff inquiries down", value: "50%" },
      { label: "Ticket upsells increase", value: "35%" },
    ],
  },

  "retail-stores": {
    slug: "retail-stores",
    name: "Retail Stores",
    tagline: "Connect Products to Information",
    description: "Product details, reviews, promotions, and loyalty",
    heroDescription:
      "Bridge the gap between physical shopping and digital information. Customers scan to see reviews, compare options, and access exclusive deals.",
    useCases: [
      {
        title: "Product Information",
        description:
          "Detailed specs, sizing guides, care instructions, and compatibility info.",
        icon: "IconTag",
      },
      {
        title: "Customer Reviews",
        description:
          "Link to verified reviews. Let customers research while standing in your store.",
        icon: "IconStar",
      },
      {
        title: "Promotions",
        description:
          "Exclusive in-store discounts, flash sales, and loyalty rewards.",
        icon: "IconDiscount2",
      },
      {
        title: "Inventory Check",
        description:
          "Other sizes, colors, or styles available online or at other locations.",
        icon: "IconPackage",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Aisle {n}", example: "Aisle 1, Aisle 2, Aisle 3..." },
      { pattern: "Display {n}", example: "Display 1, Display 2, Display 3..." },
      { pattern: "Section {n}", example: "Section A, Section B..." },
      { pattern: "SKU-{n}", example: "SKU-001, SKU-002, SKU-003..." },
    ],
    recommendedPlan: "creator",
    recommendedPlanReason:
      "Most retail stores need 20-50 QR codes for displays and sections. Creator covers this with room to grow.",
    photoSuggestions: {
      hero: "PHOTO: Modern retail store interior, clean displays, customer scanning QR code on product display.",
      useCases:
        "PHOTO: Close-up of product shelf with QR code, customer's hand holding phone.",
      cta: "PHOTO: Smiling retail employee helping customer, bright store environment.",
    },
    stats: [
      { label: "Conversion rate up", value: "18%" },
      { label: "Return rate down", value: "25%" },
      { label: "App downloads increase", value: "40%" },
    ],
  },

  "gyms-fitness": {
    slug: "gyms-fitness",
    name: "Gyms & Fitness Studios",
    tagline: "Train Smarter, Anywhere",
    description: "Equipment guides, class schedules, and workout tracking",
    heroDescription:
      "Help members get the most from your facility. QR codes on equipment show proper form, machines link to workout routines, and class schedules stay current.",
    useCases: [
      {
        title: "Equipment Instructions",
        description:
          "Video tutorials for proper form. Reduce injuries and boost confidence for new members.",
        icon: "IconBarbell",
      },
      {
        title: "Class Schedules",
        description:
          "Real-time class schedules and instant booking. No more printed schedules.",
        icon: "IconCalendar",
      },
      {
        title: "Workout Programs",
        description:
          "Scannable workout routines at each station. Members follow along independently.",
        icon: "IconClipboardCheck",
      },
      {
        title: "Membership",
        description:
          "Easy sign-up, renewals, and personal training bookings.",
        icon: "IconId",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Machine {n}", example: "Machine 1, Machine 2, Machine 3..." },
      { pattern: "Station {n}", example: "Station 1, Station 2, Station 3..." },
      { pattern: "Rack {n}", example: "Rack 1, Rack 2, Rack 3..." },
      { pattern: "{equipment}", example: "Treadmill 1, Bench Press 2..." },
    ],
    recommendedPlan: "creator",
    recommendedPlanReason:
      "Gyms typically have 30-60 pieces of equipment. Creator's 50 codes and video support are perfect.",
    photoSuggestions: {
      hero: "PHOTO: Modern gym floor with equipment, member scanning QR code on exercise machine, bright motivating environment.",
      useCases:
        "PHOTO: Person watching tutorial video on phone while at gym equipment.",
      cta: "PHOTO: Fit, friendly personal trainer helping member, positive atmosphere.",
    },
    stats: [
      { label: "Member retention up", value: "22%" },
      { label: "Equipment injuries down", value: "35%" },
      { label: "Staff questions reduced", value: "50%" },
    ],
  },

  laundromats: {
    slug: "laundromats",
    name: "Laundromats",
    tagline: "Simplify the Spin Cycle",
    description: "Machine status, payments, and instructions",
    heroDescription:
      "Make laundry day easier for everyone. Customers check machine availability, pay instantly, and get notified when their load is done.",
    useCases: [
      {
        title: "Machine Status",
        description:
          "Real-time availability of washers and dryers. Customers know before they arrive.",
        icon: "IconWashMachine",
      },
      {
        title: "Mobile Payments",
        description:
          "Coin-free payments via app or payment link. More convenient for everyone.",
        icon: "IconCreditCard",
      },
      {
        title: "Instructions",
        description:
          "How to use each machine, detergent recommendations, and cycle options.",
        icon: "IconHelp",
      },
      {
        title: "Issue Reporting",
        description:
          "Broken machine? Customers report issues instantly. You fix them faster.",
        icon: "IconAlertTriangle",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Washer {n}", example: "Washer 1, Washer 2, Washer 3..." },
      { pattern: "Dryer {n}", example: "Dryer 1, Dryer 2, Dryer 3..." },
      { pattern: "W{n}", example: "W1, W2, W3..." },
      { pattern: "D{n}", example: "D1, D2, D3..." },
    ],
    recommendedPlan: "explorer",
    recommendedPlanReason:
      "Most laundromats have 10-20 machines. Explorer's 10 codes get you started, upgrade as needed.",
    photoSuggestions: {
      hero: "PHOTO: Clean, modern laundromat interior, rows of machines, QR codes visible on each unit, customer using phone.",
      useCases:
        "PHOTO: Person scanning QR code on washing machine, phone showing payment screen.",
      cta: "PHOTO: Bright, welcoming laundromat with seating area, happy customer.",
    },
    stats: [
      { label: "Payment speed up", value: "40%" },
      { label: "Service calls reduced", value: "30%" },
      { label: "Customer satisfaction", value: "4.8★" },
    ],
  },

  "dental-offices": {
    slug: "dental-offices",
    name: "Dental Offices",
    tagline: "Streamline Patient Care",
    description: "Patient forms, appointment booking, and aftercare",
    heroDescription:
      "Reduce paperwork and waiting room time. Patients complete forms before arrival, book appointments instantly, and access aftercare instructions anytime.",
    useCases: [
      {
        title: "Patient Forms",
        description:
          "New patient intake, medical history, insurance info - all digital, all before arrival.",
        icon: "IconClipboard",
      },
      {
        title: "Appointment Booking",
        description:
          "Let patients schedule cleanings and checkups from the waiting room or home.",
        icon: "IconCalendarPlus",
      },
      {
        title: "Aftercare Instructions",
        description:
          "Post-procedure care guides patients can reference anytime. No lost papers.",
        icon: "IconFirstAidKit",
      },
      {
        title: "Insurance & Payments",
        description:
          "Coverage verification, payment plans, and billing questions answered.",
        icon: "IconReceipt",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Room {n}", example: "Room 1, Room 2, Room 3..." },
      { pattern: "Chair {n}", example: "Chair 1, Chair 2, Chair 3..." },
      { pattern: "Operatory {n}", example: "Operatory 1, Operatory 2..." },
    ],
    recommendedPlan: "explorer",
    recommendedPlanReason:
      "Most dental offices have 3-8 treatment rooms. Explorer's 10 codes cover rooms plus waiting area.",
    photoSuggestions: {
      hero: "PHOTO: Modern dental office waiting room, clean and calming, QR code on reception desk and waiting area.",
      useCases:
        "PHOTO: Patient in dental chair, QR code visible on equipment or counter.",
      cta: "PHOTO: Friendly dental team, professional but welcoming atmosphere.",
    },
    stats: [
      { label: "Check-in time reduced", value: "65%" },
      { label: "No-shows decreased", value: "40%" },
      { label: "Patient satisfaction", value: "4.9★" },
    ],
  },

  "real-estate": {
    slug: "real-estate",
    name: "Real Estate",
    tagline: "Open Houses, Always Open",
    description: "Property listings, virtual tours, and agent contact",
    heroDescription:
      "Every for-sale sign becomes an information hub. Buyers scan to see photos, floor plans, pricing, and schedule viewings - 24/7.",
    useCases: [
      {
        title: "Property Listings",
        description:
          "Full listing details, photos, floor plans, and pricing right from the curb.",
        icon: "IconHome",
      },
      {
        title: "Virtual Tours",
        description:
          "3D walkthroughs and video tours. Let buyers explore before scheduling a viewing.",
        icon: "IconVideo",
      },
      {
        title: "Agent Contact",
        description:
          "One scan to call, text, or email the listing agent. Capture leads instantly.",
        icon: "IconPhoneCall",
      },
      {
        title: "Neighborhood Info",
        description:
          "Schools, transit, shopping, and local amenities. Help buyers picture life here.",
        icon: "IconMapSearch",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Property {n}", example: "Property 1, Property 2..." },
      { pattern: "{address}", example: "123 Main St, 456 Oak Ave..." },
      { pattern: "MLS-{n}", example: "MLS-12345, MLS-12346..." },
      { pattern: "Lot {n}", example: "Lot 1, Lot 2, Lot 3..." },
    ],
    recommendedPlan: "creator",
    recommendedPlanReason:
      "Active agents have 10-40 listings at a time. Creator's 50 codes give you flexibility for all your properties.",
    photoSuggestions: {
      hero: "PHOTO: Beautiful home exterior with for-sale sign, QR code visible on sign rider, curb appeal.",
      useCases:
        "PHOTO: Buyer scanning QR code on property sign, beautiful house in background.",
      cta: "PHOTO: Professional real estate agent, confident pose, nice home or office setting.",
    },
    stats: [
      { label: "Lead capture up", value: "45%" },
      { label: "Showing requests increase", value: "35%" },
      { label: "Days on market reduced", value: "20%" },
    ],
  },

  "wedding-venues": {
    slug: "wedding-venues",
    name: "Wedding Venues",
    tagline: "Perfect Days, Perfectly Organized",
    description: "Event details, schedules, and guest information",
    heroDescription:
      "Give every guest instant access to the day's schedule, venue map, and special moments. QR codes make weddings run smoother.",
    useCases: [
      {
        title: "Event Schedule",
        description:
          "Ceremony, cocktail hour, reception - guests always know what's next and where.",
        icon: "IconClock",
      },
      {
        title: "Venue Map",
        description:
          "Ceremony site, reception hall, restrooms, parking. No one gets lost.",
        icon: "IconMap",
      },
      {
        title: "Menu & Bar",
        description:
          "Dinner options, bar selections, and dietary information at every table.",
        icon: "IconGlass",
      },
      {
        title: "Photo Sharing",
        description:
          "Guests upload photos to a shared album. Capture every moment, every angle.",
        icon: "IconCamera",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Table {n}", example: "Table 1, Table 2, Table 3..." },
      { pattern: "Table {name}", example: "Table Rose, Table Lily..." },
      { pattern: "Area {n}", example: "Area A, Area B, Area C..." },
    ],
    recommendedPlan: "creator",
    recommendedPlanReason:
      "Large weddings have 15-30 tables plus common areas. Creator's 50 codes and branding options are perfect.",
    photoSuggestions: {
      hero: "PHOTO: Elegant wedding reception setup, beautiful table settings, QR code cards on tables, romantic lighting.",
      useCases:
        "PHOTO: Wedding guest scanning QR code at table, champagne glasses, celebration atmosphere.",
      cta: "PHOTO: Happy couple at wedding venue, venue's beautiful features visible.",
    },
    stats: [
      { label: "Guest questions reduced", value: "60%" },
      { label: "Photos collected", value: "3x more" },
      { label: "Guest satisfaction", value: "4.9★" },
    ],
  },

  "wedding-expos": {
    slug: "wedding-expos",
    name: "Wedding Expos",
    tagline: "Connect Vendors and Couples",
    description: "Vendor information, catalogs, and lead capture",
    heroDescription:
      "Couples meet dozens of vendors. Help them remember you. QR codes let visitors save your info, browse portfolios, and book consultations.",
    useCases: [
      {
        title: "Vendor Portfolios",
        description:
          "Photos, videos, packages, and pricing. Everything couples need to decide.",
        icon: "IconPhoto",
      },
      {
        title: "Lead Capture",
        description:
          "Collect contact info from interested couples. Follow up after the expo.",
        icon: "IconUserPlus",
      },
      {
        title: "Special Offers",
        description:
          "Expo-exclusive deals and discounts. Create urgency to book.",
        icon: "IconGift",
      },
      {
        title: "Consultation Booking",
        description:
          "Let couples schedule follow-up meetings right from your booth.",
        icon: "IconCalendarEvent",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Booth {n}", example: "Booth 1, Booth 2, Booth 3..." },
      { pattern: "Vendor {n}", example: "Vendor 1, Vendor 2, Vendor 3..." },
      { pattern: "{vendor-name}", example: "Florist, DJ, Photographer..." },
    ],
    recommendedPlan: "explorer",
    recommendedPlanReason:
      "Each booth needs 2-5 QR codes. Explorer's 10 codes cover portfolio, booking, offers, and more.",
    photoSuggestions: {
      hero: "PHOTO: Busy wedding expo floor, vendor booths, couples browsing, QR codes on displays.",
      useCases:
        "PHOTO: Engaged couple scanning QR code at vendor booth, viewing portfolio on phone.",
      cta: "PHOTO: Wedding vendor at expo booth, professional setup, talking to couple.",
    },
    stats: [
      { label: "Lead capture up", value: "70%" },
      { label: "Post-expo bookings", value: "3x more" },
      { label: "Follow-up rate", value: "85%" },
    ],
  },

  "concert-venues": {
    slug: "concert-venues",
    name: "Concert Venues",
    tagline: "Amplify the Experience",
    description: "Event info, merchandise, and fan engagement",
    heroDescription:
      "From entry to encore, QR codes enhance the concert experience. Fans access setlists, buy merchandise, and connect with artists.",
    useCases: [
      {
        title: "Event Information",
        description:
          "Setlists, artist bios, show times, and venue policies at every seat.",
        icon: "IconMicrophone",
      },
      {
        title: "Merchandise",
        description:
          "Skip the merch line. Fans order from their seats for pickup or shipping.",
        icon: "IconShirt",
      },
      {
        title: "Food & Drinks",
        description:
          "Mobile ordering for concessions. Delivered to seat or ready for pickup.",
        icon: "IconBeer",
      },
      {
        title: "Fan Engagement",
        description:
          "Exclusive content, contests, and social sharing opportunities.",
        icon: "IconHeart",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Section {n}", example: "Section A, Section B, Section C..." },
      { pattern: "Row {n}", example: "Row 1, Row 2, Row 3..." },
      { pattern: "Seat {n}", example: "Seat 1, Seat 2, Seat 3..." },
      { pattern: "{area}", example: "GA Floor, Balcony, VIP..." },
    ],
    recommendedPlan: "champion",
    recommendedPlanReason:
      "Venues have dozens of sections and areas. Champion's 250 codes and priority support handle any venue size.",
    photoSuggestions: {
      hero: "PHOTO: Concert in progress, crowd holding phones, stage lights, QR code visible on seat or barrier.",
      useCases:
        "PHOTO: Fan scanning QR code at merchandise stand, concert t-shirts visible.",
      cta: "PHOTO: Excited concert crowd, artist on stage, amazing atmosphere.",
    },
    stats: [
      { label: "Merch sales up", value: "40%" },
      { label: "Concession revenue up", value: "25%" },
      { label: "Fan engagement", value: "3x more" },
    ],
  },

  libraries: {
    slug: "libraries",
    name: "Libraries",
    tagline: "Knowledge at Every Shelf",
    description: "Book info, digital resources, and event programs",
    heroDescription:
      "Bridge physical books with digital resources. Patrons scan to see availability, access e-books, and discover related materials.",
    useCases: [
      {
        title: "Book Information",
        description:
          "Reviews, related titles, author bios, and availability at other branches.",
        icon: "IconBook",
      },
      {
        title: "Digital Resources",
        description:
          "Link to e-books, audiobooks, and online databases. Extend the collection.",
        icon: "IconDevices",
      },
      {
        title: "Event Programs",
        description:
          "Story times, book clubs, lectures. Easy registration and reminders.",
        icon: "IconCalendarEvent",
      },
      {
        title: "Study Room Booking",
        description:
          "Reserve study rooms and meeting spaces directly from QR codes on doors.",
        icon: "IconDoor",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Shelf {n}", example: "Shelf A1, Shelf A2, Shelf B1..." },
      { pattern: "Section {n}", example: "Section 1, Section 2, Section 3..." },
      { pattern: "Room {n}", example: "Room 1, Room 2, Room 3..." },
      { pattern: "{genre}", example: "Fiction, Biography, Children..." },
    ],
    recommendedPlan: "creator",
    recommendedPlanReason:
      "Libraries have many sections and rooms. Creator's 50 codes cover shelves, rooms, and display areas.",
    photoSuggestions: {
      hero: "PHOTO: Beautiful library interior, bookshelves, natural light, QR codes visible on shelf ends or displays.",
      useCases:
        "PHOTO: Library patron scanning QR code on bookshelf, discovering new books.",
      cta: "PHOTO: Diverse group using library, studying, reading, welcoming atmosphere.",
    },
    stats: [
      { label: "Digital resource access up", value: "55%" },
      { label: "Event attendance up", value: "30%" },
      { label: "Patron satisfaction", value: "4.8★" },
    ],
  },

  warehouses: {
    slug: "warehouses",
    name: "Warehouses",
    tagline: "Inventory Intelligence",
    description: "Inventory tracking, pick lists, and equipment info",
    heroDescription:
      "Streamline warehouse operations with QR codes. Workers scan for pick instructions, inventory counts update in real-time, and equipment maintenance stays on schedule.",
    useCases: [
      {
        title: "Inventory Tracking",
        description:
          "Scan to see stock levels, location history, and reorder status.",
        icon: "IconPackage",
      },
      {
        title: "Pick & Pack",
        description:
          "Workers scan to receive pick instructions and confirm order completion.",
        icon: "IconChecklist",
      },
      {
        title: "Equipment Maintenance",
        description:
          "Maintenance schedules, manuals, and issue reporting for forklifts and machinery.",
        icon: "IconTool",
      },
      {
        title: "Safety Information",
        description:
          "Hazmat info, safety procedures, and emergency protocols at each zone.",
        icon: "IconAlertTriangle",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Aisle {n}", example: "Aisle 1, Aisle 2, Aisle 3..." },
      { pattern: "Rack {n}", example: "Rack A1, Rack A2, Rack B1..." },
      { pattern: "Bin {n}", example: "Bin 001, Bin 002, Bin 003..." },
      { pattern: "Zone {n}", example: "Zone A, Zone B, Zone C..." },
    ],
    recommendedPlan: "champion",
    recommendedPlanReason:
      "Warehouses have hundreds of locations. Champion's 250 codes and analytics help optimize operations.",
    photoSuggestions: {
      hero: "PHOTO: Modern warehouse interior, tall racks, forklift, worker scanning QR code on rack.",
      useCases:
        "PHOTO: Warehouse worker with handheld scanner, QR codes on boxes and shelves.",
      cta: "PHOTO: Organized warehouse team, safety vests, professional environment.",
    },
    stats: [
      { label: "Pick accuracy up", value: "35%" },
      { label: "Inventory time reduced", value: "50%" },
      { label: "Equipment downtime down", value: "40%" },
    ],
  },

  "parking-facilities": {
    slug: "parking-facilities",
    name: "Parking Facilities",
    tagline: "Smarter Parking, Happier Drivers",
    description: "Payment, spot finding, and EV charging",
    heroDescription:
      "Transform every parking spot into a smart space. Drivers pay from their phones, find available spots, and access EV charging - all with a quick scan.",
    useCases: [
      {
        title: "Mobile Payment",
        description:
          "No more pay stations. Drivers scan and pay from their spot.",
        icon: "IconCreditCard",
      },
      {
        title: "Spot Availability",
        description:
          "Real-time availability by zone. Drivers find spots faster.",
        icon: "IconParking",
      },
      {
        title: "EV Charging",
        description:
          "Scan to start charging, check status, and pay for electricity.",
        icon: "IconChargingPile",
      },
      {
        title: "Validation",
        description:
          "Business validation, event parking, and monthly pass management.",
        icon: "IconTicket",
      },
    ],
    batchPatternSuggestions: [
      { pattern: "Spot {n}", example: "Spot 1, Spot 2, Spot 3..." },
      { pattern: "Level {n}", example: "Level 1, Level 2, Level 3..." },
      { pattern: "{level}-{spot}", example: "P1-001, P1-002, P2-001..." },
      { pattern: "EV-{n}", example: "EV-1, EV-2, EV-3..." },
    ],
    recommendedPlan: "champion",
    recommendedPlanReason:
      "Parking facilities have 100+ spots. Champion's 250 codes cover every spot with room for growth.",
    photoSuggestions: {
      hero: "PHOTO: Modern parking garage, clean and well-lit, QR codes visible on pillars or spot markers.",
      useCases:
        "PHOTO: Driver scanning QR code on parking meter/sign, car in background.",
      cta: "PHOTO: EV charging in parking garage, modern and sustainable feel.",
    },
    stats: [
      { label: "Payment time reduced", value: "60%" },
      { label: "Revenue collection up", value: "25%" },
      { label: "Customer complaints down", value: "45%" },
    ],
  },
};

export const getVerticalBySlug = (slug: string): BusinessVertical | undefined => {
  return businessVerticals[slug];
};

export const getAllVerticals = (): BusinessVertical[] => {
  return Object.values(businessVerticals);
};

export const getVerticalSlugs = (): string[] => {
  return Object.keys(businessVerticals);
};
