export class TimeUtils {
  /*convert time string to minutes since midnight
   * @param timeString - time in HH:MM format
   * @returns number of minutes since midnight.
   */

  static timeToMinutes(timeString: string) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Check if two times are within buffer range (±60 minutes)
   * @param time1 - First time string
   * @param time2 - Second time string
   * @param bufferMinutes - Buffer in minutes (default: 60)
   * @returns True if times are within buffer range
   */
  static isTimeInBuffer(time1: string, time2: string, bufferInMinutes = 60) {
    const minutes1 = this.timeToMinutes(time1);
    const minutes2 = this.timeToMinutes(time2);
    const differennce = Math.abs(minutes1 - minutes2);
    return differennce <= bufferInMinutes;
  }

  /**
   * Get current time in HH:MM format
   * @returns Current time string
   */
  static getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /* get current Date in YYYY-MM-DD
      @returns current Date
    */
  static getCurrentDate(): string {
    const now = new Date();
    const YYYY = now.getFullYear().toString().padStart(4, '0');
    const MM = (now.getMonth() + 1).toString().padStart(2, '0');
    const DD = now.getDate().toString().padStart(2, '0');

    return `${YYYY}-${MM}-${DD}`;
  }

  /**
   * Validate time format (HH:MM)
   * @param timeString - Time string to validate
   * @returns True if valid format
   */

  static isValidTimeFormat(timeString: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
  }
}
