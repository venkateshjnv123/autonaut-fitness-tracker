// app/api/admin/exercise/route.ts
import { NextResponse } from 'next/server';
import { setDailyExercise, getDailyExercise } from '../../../lib/firestore';

// Simple admin check - in a real app, use proper auth middleware
function isAdminEmail(email?: string | null) {
  const adminEmails = ['admin@example.com', 'venkateshjnv123@gmail.com']; // Add your admin emails
  return email && adminEmails.includes(email);
}

// GET /api/admin/exercise?date=YYYY-MM-DD
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }
    
    const exercise = await getDailyExercise(date);
    return NextResponse.json({ date, exercise });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return NextResponse.json({ error: 'Failed to fetch exercise data' }, { status: 500 });
  }
}

// POST /api/admin/exercise - Set daily exercise
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, exercise, adminEmail } = body;
    
    // Simple admin check
    if (!isAdminEmail(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!date || !exercise) {
      return NextResponse.json({ 
        error: 'Date and exercise name are required' 
      }, { status: 400 });
    }
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      }, { status: 400 });
    }
    
    // Save the exercise
    await setDailyExercise(date, exercise);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Exercise set successfully',
      data: { date, exercise }
    });
  } catch (error) {
    console.error('Error setting exercise:', error);
    return NextResponse.json({ 
      error: 'Failed to set exercise' 
    }, { status: 500 });
  }
}