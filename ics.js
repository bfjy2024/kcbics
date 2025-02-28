// 生成iCalendar文件
function generateICalendar() {
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//University//Course Schedule//CN',
        'CALSCALE:GREGORIAN',
        ...courses.map((course, index) => {
            const event = createCalendarEvent(course);
            return [
                'BEGIN:VEVENT',
                `UID:${Date.now()}-${index}@university`,
                `SUMMARY:${course.name}`,
                `DESCRIPTION:班级：${course.class}\\n教师：待补充`,
                `LOCATION:${course.classroom}`,
                event.dtStart,
                event.dtEnd,
                event.rrule,
                'BEGIN:VALARM',
                'TRIGGER:-PT15M',
                'ACTION:DISPLAY',
                'DESCRIPTION:课前提醒',
                'END:VALARM',
                'END:VEVENT'
            ].join('\n');
        }),
        'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '课程表.ics';
    link.click();
}

// 创建日历事件
function createCalendarEvent(course) {
    const startDate = new Date(2025, 1, 24); // 学期开始日期
    const startDateTime = calculateFirstOccurrence(startDate, course.day);
    const [startHour, endHour] = getClassHours(course.time);

    return {
        dtStart: `DTSTART;TZID=Asia/Shanghai:${formatICalDate(startDateTime, startHour)}`,
        dtEnd: `DTEND;TZID=Asia/Shanghai:${formatICalDate(startDateTime, endHour)}`,
        rrule: generateRRULE(course.weeks, startDateTime)
    };
}

// 辅助函数
function calculateFirstOccurrence(startDate, targetDay) {
    const date = new Date(startDate);
    while (date.getDay() !== targetDay % 7) {
        date.setDate(date.getDate() + 1);
    }
    return date;
}

function getClassHours(timeSlot) {
    const hoursMap = {
        '1-2': [8, 9.5],    // 8:00-9:30
        '5-6': [14, 15.5],  // 14:00-15:30
        '7-8': [16, 17.5],  // 16:00-17:30
        '9-10': [19, 20.5]  // 19:00-20:30
    };
    return hoursMap[timeSlot];
}

function formatICalDate(date, decimalHour) {
    const hour = Math.floor(decimalHour);
    const minute = (decimalHour % 1) * 60;
    const d = new Date(date);
    d.setHours(hour, minute);
    return formatDateToiCal(d);
}

function formatDateToiCal(date) {
    return date.toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d+Z$/, '');
}

function generateRRULE(weeksCondition, startDate) {
    const [type, params] = parseWeeks(weeksCondition);
    
    const baseRule = `RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=${getDayAbbreviation(startDate.getDay())}`;
    
    switch(type) {
        case 'single':
            return `${baseRule};COUNT=${params.totalWeeks}`;
        case 'double':
            return `${baseRule};INTERVAL=2;COUNT=${Math.ceil(params.totalWeeks/2)}`;
        case 'exclude':
            return `${baseRule};UNTIL=${formatDateToiCal(params.untilDate)};EXDATE=${params.exdates.join(',')}`;
        default:
            return `${baseRule};UNTIL=${formatDateToiCal(params.untilDate)}`;
    }
}

function parseWeeks(condition) {
    // 需要根据实际情况实现条件解析逻辑
    // 返回格式示例：['single', {totalWeeks: 16}]
}
