import { generateQuestion } from './logic/generate'
import { promisify } from 'util'
import { genQuestionFormat } from './logic/genQuestionFormat'
import redisClient from './redisClient'

const getAsync = promisify(redisClient.get).bind(redisClient)
const setAsync = promisify(redisClient.set).bind(redisClient)
const delAsync = promisify(redisClient.del).bind(redisClient)

const maxScore = 3

// Function to create telegram webhook listener
const createTelegramBotHandler = bot => {
  bot.on('message', async function(msg) {
    // Check whether command is /start
    if (/\/start/.test(msg.text)) {
      const startMsg =
        'KnowJSBot tests your knowledge about JavaScript in general. Some of the things that you can do'
      const reply_markup = JSON.stringify({
        inline_keyboard: [
          [
            {
              text: 'Start Quiz',
              callback_data: 'start_quiz',
            },
          ],
        ],
      })
      bot.sendMessage(msg.chat.id, startMsg, {
        reply_markup,
      })
    } else {
      bot.sendMessage(msg.chat.id, 'Invalid message')
    }
  })
  bot.on('callback_query', async function(callbackQuery) {
    console.log('Query: ', callbackQuery)
    const { data, from } = callbackQuery
    const { id: userId } = from
    // Check whether it is a command to start the quiz
    if (data == 'start_quiz') {
      let userAnsweredCount = await getAsync(`telegram-${userId}-answered`)
      let userScore = await getAsync(`telegram-${userId}-score`)

      if (userScore >= 0) {
        bot.sendMessage(
          userId,
          'We see that you have a previously unfinished quiz. Restarting now...',
        )
        // We need to generate the list of questions for the user
        await setAsync(`telegram-${userId}-score`, 0)
        await setAsync(`telegram-${userId}-answered`, 0)
        userAnsweredCount = await getAsync(`telegram-${userId}-answered`)
      }
      let result = generateQuestion()
      const { questionDesc, answerOpts, answer } = result
      let reply_markup = genQuestionFormat(answerOpts, answer)
      bot.sendMessage(
        userId,
        `<b>Question ${parseInt(userAnsweredCount) +
          1} of ${maxScore}:</b>  ${questionDesc}`,
        {
          reply_markup,
          parse_mode: 'html',
        },
      )
    } else if (/^(answer--)(\w+)+/g.test(data)) {
      let replyMsg = ''
      let userAnsweredCount = await getAsync(`telegram-${userId}-answered`)
      let userScore = await getAsync(`telegram-${userId}-score`)

      const dataSplit = data.split('--')
      console.log(`Split: ${dataSplit}`)
      // Answer is wrong

      console.log('AnsweredCount: ', userAnsweredCount)
      if (dataSplit.length == 3) {
        console.log('Correct answer')
        replyMsg = `${dataSplit[1]} is correct! You got it right!`
        await setAsync(`telegram-${userId}-score`, parseInt(userScore) + 1)
        userScore++
      } else {
        console.log('Correct answer')
        replyMsg = `${dataSplit[1]} is wrong. The correct answer is ${
          dataSplit[3]
        }`
      }
      // Check whether correct
      console.log('AnsweredCount: ', userAnsweredCount)
      let newAnswerCount = parseInt(userAnsweredCount) + 1
      console.log('ParseAnsweredCount: ', newAnswerCount)
      await setAsync(`telegram-${userId}-answered`, newAnswerCount)
      await bot.sendMessage(userId, replyMsg)

      // Check if the game ended
      if (newAnswerCount >= maxScore) {
        // Game not ended yet
        // Generate a new game immediately
        const finalScore = getAsync(`telegram-${userId}-score`)
        const reply_markup = JSON.stringify({
          inline_keyboard: [
            [
              {
                text: 'Restart Quiz',
                callback_data: 'start_quiz',
              },
            ],
          ],
        })

        // Delete the score & answer for user since the game has ended
        await delAsync(`telegram-${userId}-score`)
        await delAsync(`telegram-${userId}-answered`)

        await bot.sendMessage(
          userId,
          `<b>Game has ended!</b> Your Total Score: ${userScore}/${maxScore} (${(userScore /
            maxScore) *
            100}%)`,
          {
            parse_mode: 'html',
            reply_markup,
          },
        )
      } else {
        userAnsweredCount = await getAsync(`telegram-${userId}-answered`)
        console.log(`Updated Count: ${userAnsweredCount}`)
        let result = generateQuestion()
        const { questionDesc, answerOpts, answer } = result
        let reply_markup = genQuestionFormat(answerOpts, answer)
        // Show user their current score
        await bot.sendMessage(
          userId,
          `<b>Question ${parseInt(userAnsweredCount) +
            1} of ${maxScore}:</b>  ${questionDesc}`,
          {
            reply_markup,
            parse_mode: 'html',
          },
        )
      }
    }
  })
}

export default createTelegramBotHandler
