import { ClassData, Enrollment } from "@/app/types/ClassEnrollmentsTypes";

export const fetchClassesFilter = async () => {
  const response = await fetch('/api/classes');
  const result = await response.json();
  const classes = result.data as ClassData[];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingClasses = classes.filter((classData) => {
    const classDate = new Date(classData.time);
    return classDate >= today;
  });

  return upcomingClasses;
};

export const fetchEnrollments = async (authToken: string) => {
  const response = await fetch('/api/enrollments', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  const result = await response.json();
  return result.data as Enrollment[];
};