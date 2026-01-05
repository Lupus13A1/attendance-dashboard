import { AttendanceRecord } from '@/types/attendance';

const studentNames = [
  'Emma Thompson', 'Liam Johnson', 'Olivia Williams', 'Noah Brown', 'Ava Davis',
  'Ethan Miller', 'Sophia Wilson', 'Mason Moore', 'Isabella Taylor', 'William Anderson',
  'Mia Thomas', 'James Jackson', 'Charlotte White', 'Benjamin Harris', 'Amelia Martin',
  'Lucas Garcia', 'Harper Martinez', 'Henry Robinson', 'Evelyn Clark', 'Alexander Lewis'
];

const generateStudentId = (index: number): string => {
  return `STU${String(index + 1).padStart(4, '0')}`;
};

const generateRandomTime = (baseHour: number, variance: number): string => {
  const hour = baseHour + Math.floor(Math.random() * variance);
  const minute = Math.floor(Math.random() * 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const getRandomStatus = (): 'Present' | 'Late' | 'Absent' => {
  const rand = Math.random();
  if (rand < 0.7) return 'Present';
  if (rand < 0.9) return 'Late';
  return 'Absent';
};

const generateAvatarUrl = (name: string): string => {
  const colors = ['0ea5e9', '22c55e', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=128`;
};

export const generateMockData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  // Generate data for the last 14 days
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dateStr = date.toISOString().split('T')[0];
    
    studentNames.forEach((name, index) => {
      const status = getRandomStatus();
      let checkInTime: string | null = null;
      let checkOutTime: string | null = null;
      
      if (status === 'Present') {
        checkInTime = generateRandomTime(7, 1); // 7:00-7:59
        checkOutTime = generateRandomTime(15, 2); // 15:00-16:59
      } else if (status === 'Late') {
        checkInTime = generateRandomTime(8, 2); // 8:00-9:59
        checkOutTime = generateRandomTime(15, 2);
      }
      
      records.push({
        studentId: generateStudentId(index),
        fullName: name,
        date: dateStr,
        checkInTime,
        checkOutTime,
        status,
        image: generateAvatarUrl(name),
      });
    });
  }
  
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockAttendanceData = generateMockData();
