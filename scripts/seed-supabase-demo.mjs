import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const demoPassword = "DellaDemo123!";
const providerBaseCity = "Kuala Lumpur";
const providerServiceRadiusKm = 25;
const shouldSeedBookings = process.env.SEED_DEMO_BOOKINGS === "true";

const demoProviderDefinitions = [
  {
    email: "chef.amina@seed.della",
    fullName: "Amina Khalid",
    marketing_name: "Chef Amina",
    service_type: "chef",
    date_of_birth: "1990-05-10",
    phone: "+60 12-400 0001",
    average_rating: 4.9,
    total_reviews: 128,
    hourly_rate: 35,
    daily_rate: 220,
    years_experience: "6 Years",
    specialties: ["Malay", "Arabic"],
    bio: "Experienced home chef for family dining and events.",
  },
  {
    email: "chef.daniel@seed.della",
    fullName: "Daniel Arif",
    marketing_name: "Chef Daniel",
    service_type: "chef",
    date_of_birth: "1988-08-14",
    phone: "+60 12-400 0002",
    average_rating: 4.8,
    total_reviews: 96,
    hourly_rate: 42,
    daily_rate: 260,
    years_experience: "8 Years",
    specialties: ["Italian", "Western"],
    bio: "Private chef for home dining, parties, and weekly meal prep.",
  },
  {
    email: "chef.meiling@seed.della",
    fullName: "Mei Ling Tan",
    marketing_name: "Chef Mei Ling",
    service_type: "chef",
    date_of_birth: "1991-04-23",
    phone: "+60 12-400 0003",
    average_rating: 4.7,
    total_reviews: 84,
    hourly_rate: 38,
    daily_rate: 240,
    years_experience: "5 Years",
    specialties: ["Chinese", "Asian"],
    bio: "Trusted DELLA chef for family gatherings and event catering.",
  },
  {
    email: "chef.hikaru@seed.della",
    fullName: "Hikaru Sato",
    marketing_name: "Chef Hikaru",
    service_type: "chef",
    date_of_birth: "1989-12-01",
    phone: "+60 12-400 0004",
    average_rating: 4.8,
    total_reviews: 73,
    hourly_rate: 40,
    daily_rate: 250,
    years_experience: "7 Years",
    specialties: ["Japanese", "Healthy"],
    bio: "Flexible chef for home service, healthy menus, and dinner events.",
  },
  {
    email: "chef.sofia@seed.della",
    fullName: "Sofia Nair",
    marketing_name: "Chef Sofia",
    service_type: "chef",
    date_of_birth: "1993-06-18",
    phone: "+60 12-400 0005",
    average_rating: 4.6,
    total_reviews: 67,
    hourly_rate: 34,
    daily_rate: 210,
    years_experience: "4 Years",
    specialties: ["Malay", "Indian"],
    bio: "Affordable family chef focused on daily meals and weekend events.",
  },
  {
    email: "maid.siti@seed.della",
    fullName: "Siti Rahman",
    marketing_name: "Siti Maid Service",
    service_type: "maid",
    date_of_birth: "1988-02-11",
    phone: "+60 12-400 0006",
    average_rating: 4.8,
    total_reviews: 96,
    hourly_rate: 25,
    daily_rate: 180,
    years_experience: "5 Years",
    specialties: ["Cleaning", "Laundry"],
    bio: "Reliable maid service for daily home care and deep cleaning.",
  },
  {
    email: "maid.devi@seed.della",
    fullName: "Devi Anand",
    marketing_name: "Devi Maid Care",
    service_type: "maid",
    date_of_birth: "1992-01-30",
    phone: "+60 12-400 0007",
    average_rating: 4.7,
    total_reviews: 88,
    hourly_rate: 24,
    daily_rate: 170,
    years_experience: "4 Years",
    specialties: ["Ironing", "Cleaning"],
    bio: "Professional maid for household support, laundry, and kitchen upkeep.",
  },
  {
    email: "maid.nora@seed.della",
    fullName: "Nora Ismail",
    marketing_name: "Nora Home Help",
    service_type: "maid",
    date_of_birth: "1990-09-09",
    phone: "+60 12-400 0008",
    average_rating: 4.8,
    total_reviews: 61,
    hourly_rate: 28,
    daily_rate: 190,
    years_experience: "6 Years",
    specialties: ["Deep cleaning", "Laundry"],
    bio: "Detailed and trusted maid for recurring home service.",
  },
  {
    email: "maid.lina@seed.della",
    fullName: "Lina Yusuf",
    marketing_name: "Lina Maid Assist",
    service_type: "maid",
    date_of_birth: "1994-05-03",
    phone: "+60 12-400 0009",
    average_rating: 4.6,
    total_reviews: 49,
    hourly_rate: 23,
    daily_rate: 165,
    years_experience: "3 Years",
    specialties: ["Cleaning", "Ironing"],
    bio: "Flexible maid support for apartments, homes, and family schedules.",
  },
  {
    email: "maid.maya@seed.della",
    fullName: "Maya Suri",
    marketing_name: "Maya Home Service",
    service_type: "maid",
    date_of_birth: "1987-11-27",
    phone: "+60 12-400 0010",
    average_rating: 4.9,
    total_reviews: 102,
    hourly_rate: 30,
    daily_rate: 200,
    years_experience: "7 Years",
    specialties: ["Cleaning", "Deep cleaning"],
    bio: "Top-rated DELLA maid for full home care and recurring visits.",
  },
  {
    email: "babysitter.aisyah@seed.della",
    fullName: "Aisyah Hamdan",
    marketing_name: "Aisyah Babysitter",
    service_type: "babysitter",
    date_of_birth: "1994-08-12",
    phone: "+60 12-400 0011",
    average_rating: 4.9,
    total_reviews: 72,
    hourly_rate: 30,
    daily_rate: 210,
    years_experience: "5 Years",
    specialties: ["Toddler care", "Night care"],
    bio: "Gentle babysitter experienced with toddlers and newborn routines.",
  },
  {
    email: "babysitter.nur@seed.della",
    fullName: "Nur Huda",
    marketing_name: "Nur Babysitting",
    service_type: "babysitter",
    date_of_birth: "1995-01-15",
    phone: "+60 12-400 0012",
    average_rating: 4.8,
    total_reviews: 64,
    hourly_rate: 28,
    daily_rate: 195,
    years_experience: "4 Years",
    specialties: ["Homework support", "Feeding"],
    bio: "Trusted childcare provider for daytime and evening support.",
  },
  {
    email: "babysitter.lina@seed.della",
    fullName: "Lina Sofia",
    marketing_name: "Lina Child Care",
    service_type: "babysitter",
    date_of_birth: "1993-03-30",
    phone: "+60 12-400 0013",
    average_rating: 4.7,
    total_reviews: 51,
    hourly_rate: 29,
    daily_rate: 205,
    years_experience: "6 Years",
    specialties: ["Newborn care", "Toddler care"],
    bio: "Warm childcare service for babies, toddlers, and school pickups.",
  },
  {
    email: "babysitter.sara@seed.della",
    fullName: "Sara Zulkifli",
    marketing_name: "Sara Baby Care",
    service_type: "babysitter",
    date_of_birth: "1996-10-06",
    phone: "+60 12-400 0014",
    average_rating: 4.8,
    total_reviews: 47,
    hourly_rate: 27,
    daily_rate: 188,
    years_experience: "3 Years",
    specialties: ["Night care", "Feeding"],
    bio: "Evening and weekend babysitter with strong parent communication.",
  },
  {
    email: "babysitter.mina@seed.della",
    fullName: "Mina Karim",
    marketing_name: "Mina Kids Support",
    service_type: "babysitter",
    date_of_birth: "1992-12-21",
    phone: "+60 12-400 0015",
    average_rating: 4.6,
    total_reviews: 43,
    hourly_rate: 26,
    daily_rate: 180,
    years_experience: "4 Years",
    specialties: ["Homework support", "Toddler care"],
    bio: "Friendly babysitter for active children and after-school care.",
  },
  {
    email: "driver.kumar@seed.della",
    fullName: "Kumar Ravi",
    marketing_name: "Driver Kumar",
    service_type: "driver",
    date_of_birth: "1987-07-19",
    phone: "+60 12-400 0016",
    average_rating: 4.7,
    total_reviews: 34,
    hourly_rate: 35,
    daily_rate: 220,
    years_experience: "6 Years",
    specialties: ["Airport pickup", "Hourly driver"],
    bio: "Experienced personal and event driver across Klang Valley.",
  },
  {
    email: "driver.azlan@seed.della",
    fullName: "Azlan Hashim",
    marketing_name: "Azlan Driver Service",
    service_type: "driver",
    date_of_birth: "1986-04-02",
    phone: "+60 12-400 0017",
    average_rating: 4.8,
    total_reviews: 56,
    hourly_rate: 38,
    daily_rate: 240,
    years_experience: "7 Years",
    specialties: ["Outstation", "Personal driver"],
    bio: "Safe and punctual driver for airport, city, and long-distance travel.",
  },
  {
    email: "driver.ravi@seed.della",
    fullName: "Ravi Muthu",
    marketing_name: "Ravi Transport",
    service_type: "driver",
    date_of_birth: "1990-02-07",
    phone: "+60 12-400 0018",
    average_rating: 4.6,
    total_reviews: 41,
    hourly_rate: 34,
    daily_rate: 210,
    years_experience: "5 Years",
    specialties: ["Delivery", "Hourly driver"],
    bio: "Flexible DELLA driver for errands, appointments, and family use.",
  },
  {
    email: "driver.hakim@seed.della",
    fullName: "Hakim Yusof",
    marketing_name: "Hakim Private Driver",
    service_type: "driver",
    date_of_birth: "1985-11-12",
    phone: "+60 12-400 0019",
    average_rating: 4.9,
    total_reviews: 77,
    hourly_rate: 40,
    daily_rate: 250,
    years_experience: "8 Years",
    specialties: ["Airport pickup", "Outstation"],
    bio: "Premium private driver for business and lifestyle bookings.",
  },
  {
    email: "driver.muthu@seed.della",
    fullName: "Muthu Velan",
    marketing_name: "Muthu Driver Link",
    service_type: "driver",
    date_of_birth: "1991-09-25",
    phone: "+60 12-400 0020",
    average_rating: 4.7,
    total_reviews: 52,
    hourly_rate: 33,
    daily_rate: 205,
    years_experience: "4 Years",
    specialties: ["Hourly driver", "Delivery"],
    bio: "Affordable personal transport and task-based driving service.",
  },
  {
    email: "cleaner.nora@seed.della",
    fullName: "Nora Hamid",
    marketing_name: "Nora Cleaner",
    service_type: "cleaner",
    date_of_birth: "1991-06-16",
    phone: "+60 12-400 0021",
    average_rating: 4.7,
    total_reviews: 58,
    hourly_rate: 28,
    daily_rate: 190,
    years_experience: "4 Years",
    specialties: ["Deep cleaning", "Vacuum"],
    bio: "Trusted cleaner for homes, offices, and move-in sessions.",
  },
  {
    email: "cleaner.freshhome@seed.della",
    fullName: "Fresha Karim",
    marketing_name: "Fresh Home Cleaner",
    service_type: "cleaner",
    date_of_birth: "1990-07-28",
    phone: "+60 12-400 0022",
    average_rating: 4.8,
    total_reviews: 69,
    hourly_rate: 29,
    daily_rate: 195,
    years_experience: "5 Years",
    specialties: ["Cleaning", "Deep cleaning"],
    bio: "Reliable cleaner for weekly maintenance and emergency requests.",
  },
  {
    email: "cleaner.spark@seed.della",
    fullName: "Indra Selvam",
    marketing_name: "Spark Clean Service",
    service_type: "cleaner",
    date_of_birth: "1994-01-19",
    phone: "+60 12-400 0023",
    average_rating: 4.6,
    total_reviews: 44,
    hourly_rate: 26,
    daily_rate: 175,
    years_experience: "3 Years",
    specialties: ["Vacuum", "Laundry"],
    bio: "Fast, tidy, and professional cleaning support for busy homes.",
  },
  {
    email: "cleaner.ecoclean@seed.della",
    fullName: "Nimmin Kaur",
    marketing_name: "EcoClean Nora",
    service_type: "cleaner",
    date_of_birth: "1988-03-11",
    phone: "+60 12-400 0024",
    average_rating: 4.8,
    total_reviews: 51,
    hourly_rate: 27,
    daily_rate: 185,
    years_experience: "6 Years",
    specialties: ["Deep cleaning", "Ironing"],
    bio: "Eco-focused cleaner using organized routines and clear communication.",
  },
  {
    email: "cleaner.dailyshine@seed.della",
    fullName: "Rani Devi",
    marketing_name: "Daily Shine Cleaner",
    service_type: "cleaner",
    date_of_birth: "1992-11-14",
    phone: "+60 12-400 0025",
    average_rating: 4.7,
    total_reviews: 47,
    hourly_rate: 25,
    daily_rate: 170,
    years_experience: "4 Years",
    specialties: ["Cleaning", "Vacuum"],
    bio: "Daily and weekly cleaner available across KL neighborhoods.",
  },
  {
    email: "tutor.farah@seed.della",
    fullName: "Farah Iqbal",
    marketing_name: "Tutor Farah",
    service_type: "tutor",
    date_of_birth: "1993-09-02",
    phone: "+60 12-400 0026",
    average_rating: 4.8,
    total_reviews: 63,
    hourly_rate: 45,
    daily_rate: 260,
    years_experience: "5 Years",
    specialties: ["Mathematics", "English"],
    bio: "Friendly tutor for school support and exam preparation.",
  },
  {
    email: "tutor.aiman@seed.della",
    fullName: "Aiman Zaki",
    marketing_name: "Teacher Aiman",
    service_type: "tutor",
    date_of_birth: "1989-05-27",
    phone: "+60 12-400 0027",
    average_rating: 4.9,
    total_reviews: 88,
    hourly_rate: 50,
    daily_rate: 280,
    years_experience: "7 Years",
    specialties: ["Science", "Mathematics"],
    bio: "Home tutor focused on confidence, clarity, and academic results.",
  },
  {
    email: "tutor.priya@seed.della",
    fullName: "Priya Kumar",
    marketing_name: "Ms Priya Tutor",
    service_type: "tutor",
    date_of_birth: "1991-02-05",
    phone: "+60 12-400 0028",
    average_rating: 4.7,
    total_reviews: 57,
    hourly_rate: 42,
    daily_rate: 245,
    years_experience: "4 Years",
    specialties: ["English", "Tamil"],
    bio: "Warm and structured tutor for primary and secondary students.",
  },
  {
    email: "tutor.erina@seed.della",
    fullName: "Erina Salleh",
    marketing_name: "BM Learning Coach",
    service_type: "tutor",
    date_of_birth: "1995-04-29",
    phone: "+60 12-400 0029",
    average_rating: 4.6,
    total_reviews: 39,
    hourly_rate: 39,
    daily_rate: 220,
    years_experience: "3 Years",
    specialties: ["BM", "Science"],
    bio: "At-home tutoring with simple lesson plans and parent updates.",
  },
  {
    email: "tutor.nadiya@seed.della",
    fullName: "Nadiya Lee",
    marketing_name: "Math Mentor Lee",
    service_type: "tutor",
    date_of_birth: "1988-10-17",
    phone: "+60 12-400 0030",
    average_rating: 4.9,
    total_reviews: 92,
    hourly_rate: 55,
    daily_rate: 300,
    years_experience: "8 Years",
    specialties: ["Mathematics", "English"],
    bio: "Experienced DELLA tutor for top-up lessons and exam prep.",
  },
  {
    email: "plumber.hafiz@seed.della",
    fullName: "Hafiz Salleh",
    marketing_name: "Plumber Hafiz",
    service_type: "plumber",
    date_of_birth: "1986-03-25",
    phone: "+60 12-400 0031",
    average_rating: 4.5,
    total_reviews: 18,
    hourly_rate: 50,
    daily_rate: 320,
    years_experience: "8 Years",
    specialties: ["Pipe repair", "Installation"],
    bio: "Fast-response plumber for repairs, leaks, and urgent fixes.",
  },
  {
    email: "plumber.waterfix@seed.della",
    fullName: "Guna Raj",
    marketing_name: "WaterFix Plumber",
    service_type: "plumber",
    date_of_birth: "1984-08-08",
    phone: "+60 12-400 0032",
    average_rating: 4.8,
    total_reviews: 51,
    hourly_rate: 55,
    daily_rate: 350,
    years_experience: "9 Years",
    specialties: ["Water leak", "Emergency repair"],
    bio: "Trusted plumbing support for homes, condos, and offices.",
  },
  {
    email: "plumber.klpipe@seed.della",
    fullName: "Karim Musa",
    marketing_name: "KL Pipe Service",
    service_type: "plumber",
    date_of_birth: "1989-01-12",
    phone: "+60 12-400 0033",
    average_rating: 4.7,
    total_reviews: 43,
    hourly_rate: 48,
    daily_rate: 310,
    years_experience: "6 Years",
    specialties: ["Toilet repair", "Pipe repair"],
    bio: "Responsive and clean plumbing work with clear pricing.",
  },
  {
    email: "plumber.rapid@seed.della",
    fullName: "Lim Wei Jian",
    marketing_name: "Rapid Plumb Care",
    service_type: "plumber",
    date_of_birth: "1990-06-01",
    phone: "+60 12-400 0034",
    average_rating: 4.6,
    total_reviews: 35,
    hourly_rate: 52,
    daily_rate: 330,
    years_experience: "5 Years",
    specialties: ["Installation", "Water leak"],
    bio: "Affordable plumbing service with emergency slots available.",
  },
  {
    email: "plumber.homepipe@seed.della",
    fullName: "Murugan Perumal",
    marketing_name: "Home Pipe Expert",
    service_type: "plumber",
    date_of_birth: "1983-11-20",
    phone: "+60 12-400 0035",
    average_rating: 4.8,
    total_reviews: 64,
    hourly_rate: 58,
    daily_rate: 360,
    years_experience: "10 Years",
    specialties: ["Emergency repair", "Toilet repair"],
    bio: "Senior plumber for difficult repair jobs and full replacements.",
  },
  {
    email: "electrician.azmi@seed.della",
    fullName: "Azmi Roslan",
    marketing_name: "Electrician Azmi",
    service_type: "electrician",
    date_of_birth: "1985-10-08",
    phone: "+60 12-400 0036",
    average_rating: 4.6,
    total_reviews: 21,
    hourly_rate: 55,
    daily_rate: 340,
    years_experience: "7 Years",
    specialties: ["Wiring", "Lighting"],
    bio: "Certified electrician for homes, condos, and small offices.",
  },
  {
    email: "electrician.brightfix@seed.della",
    fullName: "Aweiz Hamzah",
    marketing_name: "BrightFix Electric",
    service_type: "electrician",
    date_of_birth: "1988-05-16",
    phone: "+60 12-400 0037",
    average_rating: 4.8,
    total_reviews: 58,
    hourly_rate: 60,
    daily_rate: 360,
    years_experience: "8 Years",
    specialties: ["Socket repair", "Fan installation"],
    bio: "Safe and detailed electrical service with same-day slots.",
  },
  {
    email: "electrician.azhar@seed.della",
    fullName: "Shukri Azhar",
    marketing_name: "Power Home Azhar",
    service_type: "electrician",
    date_of_birth: "1989-09-09",
    phone: "+60 12-400 0038",
    average_rating: 4.7,
    total_reviews: 44,
    hourly_rate: 57,
    daily_rate: 345,
    years_experience: "6 Years",
    specialties: ["Lighting", "Wiring"],
    bio: "Reliable residential electrician for upgrades and troubleshooting.",
  },
  {
    email: "electrician.rapidvolt@seed.della",
    fullName: "Ilango Kumar",
    marketing_name: "Rapid Volt Care",
    service_type: "electrician",
    date_of_birth: "1984-07-07",
    phone: "+60 12-400 0039",
    average_rating: 4.9,
    total_reviews: 71,
    hourly_rate: 62,
    daily_rate: 380,
    years_experience: "9 Years",
    specialties: ["Emergency repair", "Socket repair"],
    bio: "Top-rated electrical support for urgent home issues.",
  },
  {
    email: "electrician.currentpro@seed.della",
    fullName: "Asai Tharman",
    marketing_name: "Home Current Pro",
    service_type: "electrician",
    date_of_birth: "1991-03-13",
    phone: "+60 12-400 0040",
    average_rating: 4.7,
    total_reviews: 52,
    hourly_rate: 58,
    daily_rate: 350,
    years_experience: "5 Years",
    specialties: ["Fan installation", "Lighting"],
    bio: "Clean installation work with clear pricing and fast support.",
  },
];

const demoUsers = [
  {
    email: "customer1@seed.della",
    fullName: "Nur Aisyah",
    role: "customer",
    status: "active",
    phone: "+60 12-111 1111",
    customerProfile: {
      date_of_birth: "1996-03-12",
      default_address: "No. 15, Jalan Ampang",
      city: "Kuala Lumpur",
      state: "Kuala Lumpur",
      country: "Malaysia",
    },
    address: {
      label: "Home",
      address_line_1: "No. 15, Jalan Ampang",
      city: "Kuala Lumpur",
      state: "Kuala Lumpur",
      postcode: "50000",
      country: "Malaysia",
      is_default: true,
    },
  },
  {
    email: "customer2@seed.della",
    fullName: "Daniel Tan",
    role: "customer",
    status: "active",
    phone: "+60 12-222 2222",
    customerProfile: {
      date_of_birth: "1992-08-21",
      default_address: "88, Jalan Tun Razak",
      city: "Petaling Jaya",
      state: "Selangor",
      country: "Malaysia",
    },
    address: {
      label: "Home",
      address_line_1: "88, Jalan Tun Razak",
      city: "Petaling Jaya",
      state: "Selangor",
      postcode: "50000",
      country: "Malaysia",
      is_default: true,
    },
  },
  {
    email: "customer3@seed.della",
    fullName: "Mei Lin",
    role: "customer",
    status: "active",
    phone: "+60 12-333 3333",
    customerProfile: {
      date_of_birth: "1998-11-05",
      default_address: "22, Jalan SS15",
      city: "Subang Jaya",
      state: "Selangor",
      country: "Malaysia",
    },
    address: {
      label: "Home",
      address_line_1: "22, Jalan SS15",
      city: "Subang Jaya",
      state: "Selangor",
      postcode: "47500",
      country: "Malaysia",
      is_default: true,
    },
  },
  ...demoProviderDefinitions.map((provider) => ({
    email: provider.email,
    fullName: provider.fullName,
    role: "service_provider",
    status: "active",
    phone: provider.phone,
    providerProfile: {
      marketing_name: provider.marketing_name,
      date_of_birth: provider.date_of_birth,
      residential_address: providerBaseCity,
      service_location: providerBaseCity,
      service_radius_km: providerServiceRadiusKm,
      approval_status: "approved",
      verification_status: "verified",
      bio: provider.bio,
      average_rating: provider.average_rating,
      total_reviews: provider.total_reviews,
      is_visible: true,
    },
    service: {
      service_type: provider.service_type,
      years_experience: provider.years_experience,
      hourly_rate: provider.hourly_rate,
      daily_rate: provider.daily_rate,
      specialties: provider.specialties,
    },
  })),
];

const bookingSeeds = [
  {
    customerEmail: "customer1@seed.della",
    providerMarketingName: "Chef Amina",
    booking_status: "scheduled",
    scheduled_date_offset: 2,
    scheduled_start_time: "10:00",
    scheduled_end_time: "14:00",
    notes: "seed demo booking - chef service",
    total_amount: 250,
    platform_fee: 25,
    provider_amount: 225,
  },
  {
    customerEmail: "customer2@seed.della",
    providerMarketingName: "Siti Maid Service",
    booking_status: "in_progress",
    scheduled_date_offset: 0,
    scheduled_start_time: "09:00",
    scheduled_end_time: "17:00",
    notes: "seed demo booking - maid service",
    total_amount: 180,
    platform_fee: 18,
    provider_amount: 162,
  },
  {
    customerEmail: "customer3@seed.della",
    providerMarketingName: "Driver Kumar",
    booking_status: "pending",
    scheduled_date_offset: 1,
    scheduled_start_time: "08:00",
    scheduled_end_time: "12:00",
    notes: "seed demo booking - driver service",
    total_amount: 220,
    platform_fee: 22,
    provider_amount: 198,
  },
];

async function listAllUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    users.push(...data.users);

    if (data.users.length < 200) {
      return users;
    }

    page += 1;
  }
}

async function getOrCreateAuthUser(user) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: demoPassword,
    email_confirm: true,
    user_metadata: {
      full_name: user.fullName,
      role: user.role,
    },
  });

  if (!error && data.user) {
    return data.user;
  }

  if (error && !/already been registered|already registered|exists/i.test(error.message)) {
    throw error;
  }

  const users = await listAllUsers();
  const existing = users.find(
    (candidate) => candidate.email?.toLowerCase() === user.email.toLowerCase(),
  );

  if (!existing) {
    throw new Error(`Could not find existing auth user for ${user.email}`);
  }

  return existing;
}

async function seedUsers() {
  const authUsers = [];

  for (const user of demoUsers) {
    const authUser = await getOrCreateAuthUser(user);
    authUsers.push({ ...user, id: authUser.id });
  }

  return authUsers;
}

async function upsertProfiles(users) {
  const { error } = await supabase.from("profiles").upsert(
    users.map((user) => ({
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      status: user.status,
      phone: user.phone,
      avatar_url: null,
    })),
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}

async function replaceCustomerData(users) {
  const customerIds = users
    .filter((user) => user.role === "customer")
    .map((user) => user.id);

  if (customerIds.length === 0) {
    return;
  }

  await supabase.from("addresses").delete().in("user_id", customerIds);
  await supabase.from("customer_profiles").delete().in("id", customerIds);

  const customers = users.filter((user) => user.role === "customer");

  const { error: profileError } = await supabase.from("customer_profiles").insert(
    customers.map((user) => ({
      id: user.id,
      ...user.customerProfile,
    })),
  );

  if (profileError) {
    throw profileError;
  }

  const { error: addressError } = await supabase.from("addresses").insert(
    customers.map((user) => ({
      user_id: user.id,
      ...user.address,
    })),
  );

  if (addressError) {
    throw addressError;
  }
}

async function replaceProviderData(users) {
  const providers = users.filter((user) => user.role === "service_provider");
  const providerIds = providers.map((user) => user.id);

  if (providerIds.length === 0) {
    return;
  }

  const { data: providerServices, error: providerServicesFetchError } = await supabase
    .from("provider_services")
    .select("id, provider_id")
    .in("provider_id", providerIds);

  if (providerServicesFetchError) {
    throw providerServicesFetchError;
  }

  const serviceIds = (providerServices ?? []).map((service) => service.id);

  if (serviceIds.length > 0) {
    const deleteSpecialties = await supabase
      .from("provider_service_specialties")
      .delete()
      .in("provider_service_id", serviceIds);

    if (deleteSpecialties.error) {
      throw deleteSpecialties.error;
    }

    const deleteMedia = await supabase
      .from("provider_service_media")
      .delete()
      .in("provider_service_id", serviceIds);

    if (deleteMedia.error) {
      throw deleteMedia.error;
    }
  }

  const deleteAvailability = await supabase
    .from("provider_availability")
    .delete()
    .in("provider_id", providerIds);

  if (deleteAvailability.error) {
    throw deleteAvailability.error;
  }

  const deleteVerifications = await supabase
    .from("provider_verifications")
    .delete()
    .in("provider_id", providerIds);

  if (deleteVerifications.error) {
    throw deleteVerifications.error;
  }

  const { error: providerProfilesError } = await supabase.from("provider_profiles").upsert(
    providers.map((user) => ({
      id: user.id,
      ...user.providerProfile,
    })),
    { onConflict: "id" },
  );

  if (providerProfilesError) {
    throw providerProfilesError;
  }

  const existingServiceByProviderId = new Map(
    (providerServices ?? []).map((service) => [service.provider_id, service.id]),
  );

  const serviceByProviderId = new Map();
  const missingProviders = [];

  for (const user of providers) {
    const existingServiceId = existingServiceByProviderId.get(user.id);

    if (existingServiceId) {
      const updateService = await supabase
        .from("provider_services")
        .update({
          service_type: user.service.service_type,
          years_experience: user.service.years_experience,
          hourly_rate: user.service.hourly_rate,
          daily_rate: user.service.daily_rate,
          is_active: true,
        })
        .eq("id", existingServiceId);

      if (updateService.error) {
        throw updateService.error;
      }

      serviceByProviderId.set(user.id, existingServiceId);
    } else {
      missingProviders.push(user);
    }
  }

  if (missingProviders.length > 0) {
    const { data: insertedServices, error: providerServicesError } = await supabase
      .from("provider_services")
      .insert(
        missingProviders.map((user) => ({
          provider_id: user.id,
          service_type: user.service.service_type,
          years_experience: user.service.years_experience,
          hourly_rate: user.service.hourly_rate,
          daily_rate: user.service.daily_rate,
          is_active: true,
        })),
      )
      .select("id, provider_id");

    if (providerServicesError) {
      throw providerServicesError;
    }

    for (const service of insertedServices ?? []) {
      serviceByProviderId.set(service.provider_id, service.id);
    }
  }

  const specialties = providers.flatMap((user) =>
    user.service.specialties.map((specialty) => ({
      provider_service_id: serviceByProviderId.get(user.id),
      specialty,
    })),
  );

  if (specialties.length > 0) {
    const { error: specialtiesError } = await supabase
      .from("provider_service_specialties")
      .insert(specialties);

    if (specialtiesError) {
      throw specialtiesError;
    }
  }

  const { error: verificationError } = await supabase
    .from("provider_verifications")
    .insert(
      providers.map((user) => ({
        provider_id: user.id,
        phone_verified: true,
        email_verified: true,
        identity_verified: user.providerProfile.verification_status === "verified",
        document_type: "IC",
        document_front_url: `/mock/docs/front-${user.email.replace("@seed.della", "")}.jpg`,
        document_back_url: `/mock/docs/back-${user.email.replace("@seed.della", "")}.jpg`,
        review_status:
          user.providerProfile.approval_status === "pending_review"
            ? "pending"
            : "approved",
        review_notes:
          user.providerProfile.approval_status === "pending_review"
            ? "Waiting for admin review"
            : "Verified for demo seed",
      })),
    );

  if (verificationError) {
    throw verificationError;
  }

  const availabilityRows = [];
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  for (const user of providers) {
    for (const day of days) {
      availabilityRows.push({
        provider_id: user.id,
        day_of_week: day,
        time_mode: "custom",
        start_time: "08:00",
        end_time: "18:00",
      });
    }
  }

  const { error: availabilityError } = await supabase
    .from("provider_availability")
    .insert(availabilityRows);

  if (availabilityError) {
    throw availabilityError;
  }
}

async function replaceBookings(users) {
  const profilesByEmail = new Map(users.map((user) => [user.email, user]));

  const { data: addresses, error: addressesError } = await supabase
    .from("addresses")
    .select("id, user_id");

  if (addressesError) {
    throw addressesError;
  }

  const { data: providerProfiles, error: providerProfilesError } = await supabase
    .from("provider_profiles")
    .select("id, marketing_name");

  if (providerProfilesError) {
    throw providerProfilesError;
  }

  const { data: providerServices, error: providerServicesError } = await supabase
    .from("provider_services")
    .select("id, provider_id");

  if (providerServicesError) {
    throw providerServicesError;
  }

  const addressByUserId = new Map((addresses ?? []).map((address) => [address.user_id, address.id]));
  const providerProfileByName = new Map(
    (providerProfiles ?? []).map((provider) => [provider.marketing_name, provider.id]),
  );
  const providerServiceByProviderId = new Map(
    (providerServices ?? []).map((service) => [service.provider_id, service.id]),
  );

  const today = new Date();
  const bookingRows = bookingSeeds.map((booking) => {
    const customer = profilesByEmail.get(booking.customerEmail);
    const providerId = providerProfileByName.get(booking.providerMarketingName);
    const providerServiceId = providerServiceByProviderId.get(providerId);
    const serviceAddressId = addressByUserId.get(customer.id);
    const scheduledDate = new Date(today);
    scheduledDate.setDate(today.getDate() + booking.scheduled_date_offset);

    return {
      customer_id: customer.id,
      provider_id: providerId,
      provider_service_id: providerServiceId,
      booking_status: booking.booking_status,
      scheduled_date: scheduledDate.toISOString().slice(0, 10),
      scheduled_start_time: booking.scheduled_start_time,
      scheduled_end_time: booking.scheduled_end_time,
      service_address_id: serviceAddressId,
      notes: booking.notes,
      total_amount: booking.total_amount,
      platform_fee: booking.platform_fee,
      provider_amount: booking.provider_amount,
    };
  });

  const { data: insertedBookings, error: bookingsError } = await supabase
    .from("bookings")
    .insert(bookingRows)
    .select("id, booking_status");

  if (bookingsError) {
    throw bookingsError;
  }

  const taskRows = [];

  for (const booking of insertedBookings ?? []) {
    const bookingStatus = booking.booking_status;
    const steps = [
      ["booking_confirmed", "done", 1],
      ["provider_assigned", "done", 2],
      [
        "provider_on_the_way",
        bookingStatus === "in_progress" || bookingStatus === "scheduled"
          ? "active"
          : "pending",
        3,
      ],
      [
        "service_started",
        bookingStatus === "in_progress" ? "active" : "pending",
        4,
      ],
      [
        "service_completed",
        bookingStatus === "completed" ? "done" : "pending",
        5,
      ],
    ];

    for (const [stepName, stepStatus, sortOrder] of steps) {
      taskRows.push({
        booking_id: booking.id,
        step_name: stepName,
        step_status: stepStatus,
        sort_order: sortOrder,
        completed_at: stepStatus === "done" ? new Date().toISOString() : null,
        notes: "Seed demo task",
      });
    }
  }

  const { error: taskError } = await supabase.from("booking_tasks").insert(taskRows);

  if (taskError) {
    throw taskError;
  }
}

async function main() {
  const seededUsers = await seedUsers();
  await upsertProfiles(seededUsers);
  await replaceCustomerData(seededUsers);
  await replaceProviderData(seededUsers);
  if (shouldSeedBookings) {
    await replaceBookings(seededUsers);
  }

  const customerCount = seededUsers.filter((user) => user.role === "customer").length;
  const providerCount = seededUsers.filter((user) => user.role === "service_provider").length;

  console.log("Seed complete.");
  console.log(`Demo password: ${demoPassword}`);
  console.log(`Customers seeded: ${customerCount}`);
  console.log(`Providers seeded: ${providerCount}`);
  console.log(
    shouldSeedBookings
      ? `Bookings seeded: ${bookingSeeds.length}`
      : "Bookings skipped. Set SEED_DEMO_BOOKINGS=true after repairing the live booking schema.",
  );
}

main().catch((error) => {
  console.error("Seed failed.");
  console.error(error);
  process.exit(1);
});
