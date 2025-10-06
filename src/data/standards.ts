export type Standard = { id: string; subject: 'ELA'|'Math'; grade: string; code: string; text: string }

export const standards: Standard[] = [
  { id: 'ELA.K.R.1', subject: 'ELA', grade: 'K', code: 'R.1', text: 'Ask and answer questions about key details in a text.' },
  { id: 'ELA.1.R.2', subject: 'ELA', grade: '1', code: 'R.2', text: 'Retell stories, including key details, and demonstrate understanding of their central message or lesson.' },
  { id: 'ELA.2.W.3', subject: 'ELA', grade: '2', code: 'W.3', text: 'Write narratives to develop real or imagined experiences using effective technique, descriptive details, and clear event sequences.' },
  { id: 'Math.K.CC.1', subject: 'Math', grade: 'K', code: 'CC.1', text: 'Count to 100 by ones and by tens.' },
  { id: 'Math.1.OA.1', subject: 'Math', grade: '1', code: 'OA.1', text: 'Use addition and subtraction within 20 to solve word problems.' },
  { id: 'Math.2.MD.1', subject: 'Math', grade: '2', code: 'MD.1', text: 'Measure the length of an object by selecting and using appropriate tools such as rulers, yardsticks, meter sticks, and measuring tapes.' },
]
