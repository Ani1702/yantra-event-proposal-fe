# Yantra Event Proposal - Frontend

A professional, minimalistic Next.js frontend for submitting event proposals to Yantra.

## Features

- Clean, sharp-edged design with no rounded corners
- Professional black and white theme
- Form validation for all required fields
- Real-time submission feedback
- Responsive design
- Connected to Express/Prisma backend API

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Ensure backend is running:**
Make sure the backend server is running on `http://localhost:3000`

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3001](http://localhost:3001) (or the port shown in terminal)

## Form Fields

- **Computer Club Name** - Name of the organizing club
- **Event Type** - Choose from:
  - Technical Competition (`tech_comp`)
  - Hackathon (`hackathon`)
  - Workshop (`workshop`)
  - Tech Talk (`tech_talk`)
- **Event Title** - Title of the event
- **Event Proposal** - Detailed description of the event
- **Expected Capacity** - Number of expected participants (must be positive number)
- **Duration** - How long the event will run (e.g., "2 hours", "1 day")

## API Integration

The form submits to:
```
POST http://localhost:3000/api/proposals
```

**Important:** Make sure your backend server is running before submitting the form.

## Design Philosophy

- Sharp, professional aesthetic
- No rounded corners (fully edged design)
- Black and white color scheme
- Bold, uppercase typography
- Clear visual hierarchy
- Minimalistic and clean layout

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hooks** - State management

## Project Structure

```
app/
├── page.tsx          # Main form component
├── layout.tsx        # Root layout with metadata
└── globals.css       # Global styles (sharp edges, no rounds)
```

## Customization

To customize the logo placeholders, replace the content in the header and footer sections of `app/page.tsx`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
