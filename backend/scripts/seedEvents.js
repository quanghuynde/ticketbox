const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const Category = require('../src/models/Category');
    const Event = require('../src/models/Event');
    const User = require('../src/models/User');

    // Get admin user
    const admin = await User.findOne({ email: 'admin@ticketbox.com' });
    if (!admin) {
      console.error('Admin user not found. Run seedAdmin.js first.');
      process.exit(1);
    }

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Hòa nhạc', description: 'Các sự kiện nhạc sống' },
      { name: 'Hội thảo', description: 'Các sự kiện hội thảo' },
      { name: 'Seminar', description: 'Các sự kiện seminar' },
      { name: 'Workshop', description: 'Các workshop thực hành' },
    ]);

    console.log(`Created ${categories.length} categories`);

    // Create sample events
    const events = [
      {
        title: 'FPT Music Festival 2026',
        description: 'Annual music festival for university students',
        eventDate: new Date('2026-08-16'),
        location: 'FPT University Hoa Lac',
        categoryId: categories[0]._id,
        createdBy: admin._id,
        image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2670&auto=format&fit=crop',
        status: 'upcoming'
      },
      {
        title: 'Web Development Masterclass',
        description: 'Learn modern web development techniques',
        eventDate: new Date('2026-07-10'),
        location: 'Tech Hub Ho Chi Minh',
        categoryId: categories[2]._id,
        createdBy: admin._id,
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop',
        status: 'upcoming'
      },
      {
        title: 'AI & Machine Learning Workshop',
        description: 'Hands-on workshop on AI and ML applications',
        eventDate: new Date('2026-07-20'),
        location: 'Hanoi Innovation Center',
        categoryId: categories[3]._id,
        createdBy: admin._id,
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop',
        status: 'upcoming'
      },
      {
        title: 'Tech Talk: Cloud Computing',
        description: 'Discussion on cloud computing trends',
        eventDate: new Date('2026-07-15'),
        location: 'Online',
        categoryId: categories[1]._id,
        createdBy: admin._id,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop',
        status: 'upcoming'
      },
      {
        title: 'Jazz Night Live',
        description: 'Enjoy live jazz music performance',
        eventDate: new Date('2026-08-05'),
        location: 'The Blue Note Saigon',
        categoryId: categories[0]._id,
        createdBy: admin._id,
        image: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2670&auto=format&fit=crop',
        status: 'upcoming'
      },
      {
        title: 'Startup Pitch Night',
        description: 'Startups pitch their ideas to investors',
        eventDate: new Date('2026-07-25'),
        location: 'StartupHub Vietnam',
        categoryId: categories[1]._id,
        createdBy: admin._id,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop',
        status: 'upcoming'
      }
    ];

    const createdEvents = await Event.insertMany(events);
    console.log(`Created ${createdEvents.length} events successfully`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding events:', err);
    process.exit(1);
  }
};

seedEvents();
