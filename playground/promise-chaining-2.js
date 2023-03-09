require('../src/db/mongoose')
const Task = require('../src/models/task')

// Task.findByIdAndDelete('63f88d651eeb6463682b270e').then((task) => {
//     console.log(task)
//     return Task.countDocuments({ completed: false })
// }).then((result) => {
//     console.log(result)
// }).catch((e) => {
//     console.log(e)
// })

const deleteTaskAndCount = async (id) => {
    const task = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({ completed: false })
    return count
}

deleteTaskAndCount('63f87d3f78f60c4f195fd556').then((count) => {
    console.log(count)
}).catch((e) => {
    console.log(e)
});