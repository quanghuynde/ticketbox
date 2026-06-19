// Using built-in fetch (Node 18+)

const API_URL = 'http://localhost:5000/api';
let token = '';

const test = async () => {
  try {
    console.log('--- Testing Admin Login ---');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ticketbox.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(`Login failed: ${loginData.message}`);
    token = loginData.token;
    console.log('Login successful');

    console.log('\n--- Testing Category Creation ---');
    const catRes = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: 'Test Category', description: 'Test Description' })
    });
    const catData = await catRes.json();
    if (!catRes.ok) throw new Error(`Category creation failed: ${JSON.stringify(catData)}`);
    console.log('Category created:', catData.name);

    console.log('\n--- Testing Event Creation ---');
    const eventRes = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        title: 'Test Event',
        description: 'Test Event Description',
        eventDate: new Date(Date.now() + 86400000).toISOString(),
        location: 'Test Location',
        categoryId: catData._id
      })
    });
    const eventData = await eventRes.json();
    if (!eventRes.ok) throw new Error(`Event creation failed: ${JSON.stringify(eventData)}`);
    console.log('Event created:', eventData.title);

    console.log('\n--- Testing Ticket Creation ---');
    const tkRes = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        eventId: eventData._id,
        ticketName: 'Test VIP',
        price: 1000000,
        quantity: 100
      })
    });
    const tkData = await tkRes.json();
    if (!tkRes.ok) throw new Error(`Ticket creation failed: ${JSON.stringify(tkData)}`);
    console.log('Ticket created:', tkData.ticketName);

    console.log('\n--- Cleaning up ---');
    await fetch(`${API_URL}/tickets/${tkData._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    await fetch(`${API_URL}/events/${eventData._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    await fetch(`${API_URL}/categories/${catData._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    console.log('Cleanup successful');

    console.log('\n--- VERIFICATION SUCCESSFUL ---');
  } catch (err) {
    console.error('\n--- VERIFICATION FAILED ---');
    console.error(err.message);
    process.exit(1);
  }
};

test();
