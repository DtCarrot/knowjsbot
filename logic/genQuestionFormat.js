const genQuestionFormat = (answerOpts, answer) => {
  let answer_replies = answerOpts.map(answerObj => {
    return {
      text: answerObj.name,
      callback_data:
        answerObj.name == answer.name
          ? `answer--${answerObj.name}--correct`
          : `answer--${answerObj.name}--wrong--${answer.name}`,
    }
  })
  const reply_markup = JSON.stringify({
    inline_keyboard: [answer_replies],
  })
  return reply_markup
}

export { genQuestionFormat }
