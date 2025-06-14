/**
 * Utility functions for handling instructor data
 */

export interface InstructorObject {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
}

export type InstructorType = string | InstructorObject;

/**
 * Get the display name for an instructor
 * @param instructor - Either a string or instructor object
 * @returns The instructor's display name
 */
export const getInstructorName = (instructor: InstructorType): string => {
  if (typeof instructor === 'string') {
    return instructor;
  }
  
  if (instructor && typeof instructor === 'object') {
    return `${instructor.firstName} ${instructor.lastName}`.trim();
  }
  
  return 'Unknown Instructor';
};

/**
 * Get the instructor's username
 * @param instructor - Either a string or instructor object
 * @returns The instructor's username or the string itself
 */
export const getInstructorUsername = (instructor: InstructorType): string => {
  if (typeof instructor === 'string') {
    return instructor;
  }
  
  if (instructor && typeof instructor === 'object') {
    return instructor.username;
  }
  
  return 'unknown';
};

/**
 * Check if instructor is an object
 * @param instructor - Either a string or instructor object
 * @returns True if instructor is an object
 */
export const isInstructorObject = (instructor: InstructorType): instructor is InstructorObject => {
  return typeof instructor === 'object' && instructor !== null;
};

/**
 * Get instructor initials for avatar display
 * @param instructor - Either a string or instructor object
 * @returns Initials string
 */
export const getInstructorInitials = (instructor: InstructorType): string => {
  if (typeof instructor === 'string') {
    const words = instructor.split(' ');
    return words.map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
  }
  
  if (instructor && typeof instructor === 'object') {
    const firstInitial = instructor.firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = instructor.lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  }
  
  return 'UI';
};
