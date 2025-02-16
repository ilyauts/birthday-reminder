/**
 * CONSTANTS TO CHANGE
 */
const SPREADSHEET_ID = 'REPLACE_ME'; // Change this to your spreadsheet ID
const UNKNOWN_CHARS = '????'; // Birthdays will feature this string is some part of them is unknown
const CALENDAR_ID = 'primary';


/**
 * Read the data from the spreadsheet DB
 */
function readBirthdays() {
  try {
    console.log('Pulling birthday from Google Sheets Database...')
    const result = Sheets.Spreadsheets.Values.get(SPREADSHEET_ID, 'A:Z');

    // For now we only care about the first two columns (name and birthday)
    const birthdays = result.values.map(v => [v[0], v[1]]).filter(v => v[1] && !v[1]?.includes(UNKNOWN_CHARS));

    console.log('Birthdays processing completed...')
    return birthdays;
  } catch (err) {
    console.log('Failed with error %s', err.message);
  }
}

/**
 * Checks if the birthday already exists for this person 
 */
function duplicateBirthdayEntry(birthday) {
  const [birthdayName, birthdate] = birthday; 
  const fullBirthdayEventName = birthdayNameWrapper(birthdayName);
  
  try {
    // Get Events for this day
    const nextBirthdate = findNextBirthday(birthdate);
    const startDate = getRelativeDate(nextBirthdate, 0, 0);
    const endDate = getRelativeDate(nextBirthdate, 1, 0);

    const events = Calendar.Events.list(
      CALENDAR_ID,{
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString()
    });

    for(const item of events.items) {
      if(item.summary === fullBirthdayEventName) {
        console.log(`Duplicate found: ${item.summary}, skipping...`);

        // Uncomment if you'd like to purge existing entries
        // event = Calendar.Events.remove(CALENDAR_ID, item.id);
        return true;
      }
    }

    console.log(`No matches found for ${fullBirthdayEventName}`);
    return false;
  } catch (err) {
    console.log('Failed with error %s', err.message);
  }

  return true;
}

/**
 * Creates a birthday for the person
 */
function createBirthday(birthday) {  
  const [birthdayName, birthdate] = birthday; 
  const fullBirthdayEventName = birthdayNameWrapper(birthdayName);

  const nextBirthday = findNextBirthday(birthdate);
  const followingDate = getRelativeDate(new Date(nextBirthday), 1, 0);

  const nextBirthdayString = convertToStandardDateFormat(nextBirthday);
  const followingDateString = convertToStandardDateFormatFromObj(followingDate);
  
  console.log(`Creating new birthday entry for ${birthdayName}...`);

  let event = {
    summary: fullBirthdayEventName,
    start: {
      date: nextBirthdayString,
    },
    end: {
      date: followingDateString,
    },
    attendees: [      
    ],
    // Grape background. Use Calendar.Colors.get() for the full list.
    colorId: 3,
    eventType: 'birthday',
    reminders: {
      useDefault: false,
      overrides: [{
        method: 'email',
        minutes: 0
      }, {
        method: 'popup',
        minutes: 0
      }]
    },
    recurrence: [
      'RRULE:FREQ=YEARLY;WKST=MO;'
    ],
    transparency: 'transparent',
    visibility: 'private'
  };

  try {
    // call method to insert/create new event in provided calandar
    event = Calendar.Events.insert(event, CALENDAR_ID);
    console.log('Event ID: ' + event.id, event);
  } catch (err) {
    console.log('Failed with error %s', err.message);
  }
}

/**
 * Helper function to get a new Date object relative to the current date.
 * @param {number} daysOffset The number of days in the future for the new date.
 * @param {number} hour The hour of the day for the new date, in the time zone
 *     of the script.
 * @return {Date} The new date.
 */
function getRelativeDate(baseDate, daysOffset, hour) {
  const date = new Date(baseDate);

  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

/**
 * Helper function to get a new Date object relative to the current date.
 * @param {number} month of the birthday.
 * @param {number} day of the birthday.
 * @param {number} year of the birthday.
 * @return {[Date, Date]} The new start and end date.
 */
function fullDay(month, day, year) {
  const date = new Date();
  date.setFullYear(year);
  date.setMonth(month-1);
  date.setDate(day);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1)

  return [date, endDate];
}

/**
 * Birthday wrapper function
 */
function birthdayNameWrapper(name) {
  return `${name}'s Birthday!`;
}

/** 
 * Convert to a Google Calendar Understandable Date, from DB date
 */
function convertToStandardDateFormat(date) {
  const dateArr = date.split('/');

  const newDateArr = [dateArr[2], dateArr[0], dateArr[1]];
  return newDateArr.join('-');
}

/** 
 * Convert to a Google Calendar Understandable Date, from Date Obj
 */
function convertToStandardDateFormatFromObj(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  return dateString;
}

/** 
 * Determine next birthdate
 */
function findNextBirthday(date) {
  const dateArr = date.split('/');

  const currDate = new Date();
  const currDateYear = currDate.getFullYear();

  dateArr[2] = currDateYear;

  const tempDate = new Date(dateArr[2], dateArr[0], dateArr[1]);

  // Ensure that we're only looking at birthdays that haven't happened this year
  if(currDate <= tempDate) {
    return dateArr.join('/');
  } else {
    // Otherwise choose it for next year
    dateArr[2] = currDateYear + 1;
    return dateArr.join('/');
  }
}

/** 
 * Controller
 */
function main() {
  console.log('Kicked off processing')
  const birthdayArray = readBirthdays();

  for(const birthday of birthdayArray) {
    // Skip the header row
    if(birthday[0] === 'Name') {
      continue;
    }

    console.log(`Veryfing existence of ${birthdayNameWrapper(birthday[0])}...`);
    if(!duplicateBirthdayEntry(birthday)) {
      createBirthday(birthday)
    }
  }
}