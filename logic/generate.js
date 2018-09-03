import data from '../data/data'

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
let shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

let generateQuestion = () => {
  console.log('Preparing to generate qn')
  let listLength = data.length
  let questionOpts = 4
  let questionOptsArr = []
  for (var i = 0; i < questionOpts; i++) {
    let unique = false
    let randomIdx = 0
    // While loop while the index is not unique
    while (!unique) {
      randomIdx = Math.floor(Math.random() * listLength)

      // Check whether there is a duplicate option in the answer set
      unique = !questionOptsArr.includes(randomIdx)
    }
    questionOptsArr.push(randomIdx)
  }

  // Answer will be default be the first idx in opts
  let answerIdx = questionOptsArr[0]
  let questionDesc = 'What is ' + data[answerIdx].description

  let answerOpts = questionOptsArr.map(itemIdx => {
    let { name, description, url } = data[itemIdx]
    return {
      name,
      description,
      url,
    }
  })
  // Randomly shuffle the answer
  answerOpts = shuffle(answerOpts)
  return {
    questionDesc,
    answer: {
      name: data[answerIdx].name,
      url: data[answerIdx].url,
    },
    answerOpts,
  }
}

export { generateQuestion }
