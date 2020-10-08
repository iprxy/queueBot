const fs = require('fs').promises
const timeSheet = require('./utils/timesheet')

class Queue {
  _currentDateFile() {
    const currentDate = new Date()
    return `./files/${currentDate.getDate()}-${new Date().getMonth()+1}-${currentDate.getFullYear()}.json`
  }

  async _createTodayFile() {
    try {
      await fs.writeFile(this._currentDateFile(), JSON.stringify(timeSheet))
      return this.getTodayFile()
    } catch (err) {
      throw (err)
    }
  }

  async getTodayFile() {
    try {
      const todayFile = await fs.readFile(this._currentDateFile(), 'utf-8')
      return JSON.parse(todayFile)
    } catch (err) {
      if (err.code === 'ENOENT') {
        return await this._createTodayFile()
      } else {
        throw err
      }
    }
  }

  async setQueue(time, username) {
    const todayFile = await this.getTodayFile()
    if (!todayFile[time].length) {
      todayFile[time] = username
      await fs.writeFile(this._currentDateFile(), JSON.stringify(todayFile))
      return todayFile
    } else {
      return false
    }
  }

  async removeQueue(time, username) {
    const todayFile = await this.getTodayFile()
    if (todayFile[time].length && todayFile[time] === username) {
      todayFile[time] = ''
      await fs.writeFile(this._currentDateFile(), JSON.stringify(todayFile))
      return todayFile
    } else {
      return false
    }
  }
}

module.exports = Queue