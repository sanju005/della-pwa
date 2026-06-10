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
  {
    email: "chef.amina@seed.della",
    fullName: "Amina Khalid",
    role: "service_provider",
    status: "active",
    phone: "+60 12-400 0001",
    providerProfile: {
      marketing_name: "Chef Amina",
      date_of_birth: "1990-05-10",
      residential_address: providerBaseCity,
      service_location: providerBaseCity,
      service_radius_km: providerServiceRadiusKm,
      approval_status: "approved",
      verification_status: "verified",
      bio: "Experienced home chef specializing in family meals and event catering.",
      average_rating: 4.8,
      total_reviews: 29,
      is_visible: true,
    },
    service: {
      service_type: "chef",
      years_experience: "5 Years",
      hourly_rate: 40,
      daily_rate: 250,
      specialties: ["Malay", "Arabic", "Indian"],
    },
  },
  {
    email: "maid.siti@seed.della",
    fullName: "Siti Rahman",
    role: "service_provider",
    status: "active",
    phone: "+60 12-400 0002",
    providerProfile: {
      marketing_name: "Maid Siti",
      date_of_birth: "1988-02-11",
      residential_address: providerBaseCity,
      service_location: providerBaseCity,
      service_radius_km: providerServiceRadiusKm,
      approval_status: "approved",
      verification_status: "verified",
      bio: "Trusted maid for daily cleaning, ironing, and home care.",
      average_rating: 4.7,
      total_reviews: 14,
      is_visible: true,
    },
    service: {
      service_type: "maid",
      years_experience: "4 Years",
      hourly_rate: 25,
      daily_rate: 180,
      specialties: ["Cleaning", "Ironing", "Laundry"],
    },
  },
  {
    email: "driver.kumar@seed.della",
    fullName: "Kumar Ravi",
    role: "service_provider",
    status: "active",
    phone: "+60 12-400 0003",
    providerProfile: {
      marketing_name: "Driver Kumar",
      date_of_birth: "1987-07-19",
      residential_address: providerBaseCity,
      service_location: providerBaseCity,
      service_radius_km: providerServiceRadiusKm,
      approval_status: "approved",
      verification_status: "verified",
      bio: "Professional driver for city trips, airport pickup, and outstation rides.",
      average_rating: 4.7,
      total_reviews: 34,
      is_visible: true,
    },
    service: {
      service_type: "driver",
      years_experience: "6 Years",
      hourly_rate: 35,
      daily_rate: 220,
      specialties: ["Airport pickup", "Outstation", "Hourly driver"],
    },
  },
  {
    email: "tutor.farah@seed.della",
    fullName: "Farah Iqbal",
    role: "service_provider",
    status: "active",
    phone: "+60 12-400 0004",
    providerProfile: {
      marketing_name: "Tutor Farah",
      date_of_birth: "1993-09-02",
      residential_address: providerBaseCity,
      service_location: providerBaseCity,
      service_radius_km: providerServiceRadiusKm,
      approval_status: "approved",
      verification_status: "verified",
      bio: "Friendly tutor for school subjects and exam preparation.",
      average_rating: 4.7,
      total_reviews: 14,
      is_visible: true,
    },
    service: {
      service_type: "tutor",
      years_experience: "5 Years",
      hourly_rate: 45,
      daily_rate: 260,
      specialties: ["Mathematics", "English", "Science"],
    },
  },
  {
    email: "cleaner.nora@seed.della",
    fullName: "Nora Hamid",
    role: "service_provider",
    status: "active",
    phone: "+60 12-400 0005",
    providerProfile: {
      marketing_name: "Cleaner Nora",
      date_of_birth: "1991-06-16",
      residential_address: providerBaseCity,
      service_location: providerBaseCity,
      service_radius_km: providerServiceRadiusKm,
      approval_status: "approved",
      verification_status: "verified",
      bio: "Detailed cleaner for home and office deep cleaning.",
      average_rating: 4.7,
      total_reviews: 14,
      is_visible: true,
    },
    service: {
      service_type: "cleaner",
      years_experience: "4 Years",
      hourly_rate: 28,
      daily_rate: 190,
      specialties: ["Deep cleaning", "Vacuum", "Cleaning"],
    },
  },
  {
    email: "babysitter.lina@seed.della",
    fullName: "Lina Yusuf",
    role: "service_provider",
    status: "active",
    phone: "+60 12-400 0006",
    providerProfile: {
      marketing_name: "Babysitter Lina",
      date_of_birth: "1994-12-01",
      residential_address: providerBaseCity,
      service_location: providerBaseCity,
      service_radius_km: providerServiceRadiusKm,
      approval_status: "approved",
      verification_status: "verified",
      bio: "Caring babysitter with experience in toddler and newborn care.",
      average_rating: 4.7,
      total_reviews: 14,
      is_visible: true,
    },
    service: {
      service_type: "babysitter",
      years_experience: "6 Years",
      hourly_rate: 32,
      daily_rate: 210,
      specialties: ["Toddler care", "Homework support", "Night care"],
    },
  },
  {
    email: "plumber.hafiz@seed.della",
    fullName: "Hafiz Salleh",
    role: "service_provider",
    status: "active",
    phone: "+60 12-400 0007",
    providerProfile: {
      marketing_name: "Plumber Hafiz",
      date_of_birth: "1986-03-25",
      residential_address: providerBaseCity,
      service_location: providerBaseCity,
      service_radius_km: providerServiceRadiusKm,
      approval_status: "approved",
      verification_status: "verified",
      bio: "Fast-response plumber for repairs and installations.",
      average_rating: 4.5,
      total_reviews: 18,
      is_visible: true,
    },
    service: {
      service_type: "plumber",
      years_experience: "8 Years",
      hourly_rate: 50,
      daily_rate: 320,
      specialties: ["Pipe repair", "Water leak", "Installation"],
    },
  },
  {
    email: "electrician.azmi@seed.della",
    fullName: "Azmi Roslan",
    role: "service_provider",
    status: "active",
    phone: "+60 12-400 0008",
    providerProfile: {
      marketing_name: "Electrician Azmi",
      date_of_birth: "1985-10-08",
      residential_address: providerBaseCity,
      service_location: providerBaseCity,
      service_radius_km: providerServiceRadiusKm,
      approval_status: "approved",
      verification_status: "verified",
      bio: "Certified electrician for residential electrical work.",
      average_rating: 4.6,
      total_reviews: 21,
      is_visible: true,
    },
    service: {
      service_type: "electrician",
      years_experience: "7 Years",
      hourly_rate: 55,
      daily_rate: 340,
      specialties: ["Wiring", "Lighting", "Socket repair"],
    },
  },
  {
    email: "chef.raj@seed.della",
    fullName: "Raj Menon",
    role: "service_provider",
    status: "active",
    phone: "+60 12-400 0009",
    providerProfile: {
      marketing_name: "Chef Raj",
      date_of_birth: "1989-04-13",
      residential_address: providerBaseCity,
      service_location: providerBaseCity,
      service_radius_km: providerServiceRadiusKm,
      approval_status: "approved",
      verification_status: "verified",
      bio: "Private chef for Indian, Malay, and event dining.",
      average_rating: 4.9,
      total_reviews: 17,
      is_visible: true,
    },
    service: {
      service_type: "chef",
      years_experience: "9 Years",
      hourly_rate: 48,
      daily_rate: 280,
      specialties: ["Indian", "Malay", "Western"],
    },
  },
  {
    email: "maid.devi@seed.della",
    fullName: "Devi Anand",
    role: "service_provider",
    status: "pending",
    phone: "+60 12-400 0010",
    providerProfile: {
      marketing_name: "Maid Devi",
      date_of_birth: "1992-01-30",
      residential_address: providerBaseCity,
      service_location: providerBaseCity,
      service_radius_km: providerServiceRadiusKm,
      approval_status: "pending_review",
      verification_status: "partially_verified",
      bio: "Reliable maid available for household support.",
      average_rating: 0,
      total_reviews: 0,
      is_visible: false,
    },
    service: {
      service_type: "maid",
      years_experience: "3 Years",
      hourly_rate: 23,
      daily_rate: 170,
      specialties: ["Cleaning", "Laundry", "Ironing"],
    },
  },
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
    providerMarketingName: "Maid Siti",
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
    await supabase
      .from("provider_service_specialties")
      .delete()
      .in("provider_service_id", serviceIds);
    await supabase
      .from("provider_service_media")
      .delete()
      .in("provider_service_id", serviceIds);
  }

  await supabase.from("provider_availability").delete().in("provider_id", providerIds);
  await supabase.from("provider_verifications").delete().in("provider_id", providerIds);
  await supabase.from("provider_services").delete().in("provider_id", providerIds);
  await supabase.from("provider_profiles").delete().in("id", providerIds);

  const { error: providerProfilesError } = await supabase.from("provider_profiles").insert(
    providers.map((user) => ({
      id: user.id,
      ...user.providerProfile,
    })),
  );

  if (providerProfilesError) {
    throw providerProfilesError;
  }

  const { data: insertedServices, error: providerServicesError } = await supabase
    .from("provider_services")
    .insert(
      providers.map((user) => ({
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

  const serviceByProviderId = new Map(
    (insertedServices ?? []).map((service) => [service.provider_id, service.id]),
  );

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
  const { data: oldBookings, error: oldBookingsError } = await supabase
    .from("bookings")
    .select("id")
    .ilike("notes", "%seed demo%");

  if (oldBookingsError) {
    throw oldBookingsError;
  }

  const oldBookingIds = (oldBookings ?? []).map((booking) => booking.id);

  if (oldBookingIds.length > 0) {
    await supabase.from("booking_tasks").delete().in("booking_id", oldBookingIds);
    await supabase.from("booking_status_history").delete().in("booking_id", oldBookingIds);
    await supabase.from("messages").delete().in("booking_id", oldBookingIds);
    await supabase.from("payments").delete().in("booking_id", oldBookingIds);
    await supabase.from("bookings").delete().in("id", oldBookingIds);
  }

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
  await replaceBookings(seededUsers);

  const customerCount = seededUsers.filter((user) => user.role === "customer").length;
  const providerCount = seededUsers.filter((user) => user.role === "service_provider").length;

  console.log("Seed complete.");
  console.log(`Demo password: ${demoPassword}`);
  console.log(`Customers seeded: ${customerCount}`);
  console.log(`Providers seeded: ${providerCount}`);
  console.log(`Bookings seeded: ${bookingSeeds.length}`);
}

main().catch((error) => {
  console.error("Seed failed.");
  console.error(error);
  process.exit(1);
});
