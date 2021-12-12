import * as fs from 'fs'
import * as path from 'path'
import child_process from 'child_process'

const CPUTIL_PATH =
  process.platform === 'darwin'
    ? path.join(__dirname, './bin/macos/cputil')
    : path.join(__dirname, './bin/linux/cputil')

export enum StarPrinterType {
  THERMAL_2 = 'thermal2',
  THERMAL_3 = 'thermal3',
  THERMAL_4 = 'thermal4',
}

export enum StarContentType {
  STAR_PRNT = 'application/vnd.star.starprnt',
}

/**
 * @desc takes a string of Star Prnt MarkUp and converts it to a format that can be handed to Star printers for printing.
 * @param {String} text
 * @returns {String}
 */
export const convertStarPrintMarkUp = async (
  text: string,
  outputFormat: StarContentType,
  printerType?: StarPrinterType
) => {
  if (!text) return Promise.reject(new Error('text'))

  const fileName = `starMarkUp-${new Date().getTime()}.stm`
  const tmpFilePath = path.join(__dirname, `./tmp/${fileName}`)
  const outputFilePath = path.join(__dirname, `./output/${fileName.replace('.stm', '.bin')}`)

  let cmd = ''

  if (printerType) cmd = printerType

  cmd += ' scale-to-fit decode'

  await Promise.all([
    makeDir(path.join(__dirname, './tmp')),
    makeDir(path.join(__dirname, './output')),
  ])

  await writeFile(tmpFilePath, text)

  await execCputil(cmd, [outputFormat, tmpFilePath, outputFilePath])

  const fileBuffer = (await readFile(outputFilePath)) as any

  return Promise.all([deleteFile(tmpFilePath), deleteFile(outputFilePath)]).then(() => {
    return fileBuffer.toString('utf8')
  })
}

async function readFile(filename: string) {
  if (!filename) return Promise.reject(new Error('filename'))

  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, result) => {
      if (err) return reject(err)

      return resolve(result)
    })
  })
}

async function writeFile(filename: string, data: string) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, data, (err: any) => {
      if (err) return reject(err)

      return resolve(null)
    })
  })
}

function deleteFile(filename: string) {
  return new Promise((resolve, reject) => {
    fs.unlink(filename, (err: any) => {
      if (err) return reject(err)

      return resolve(null)
    })
  })
}

async function execCputil(command: string, args?: string[]) {
  args = !args || !args.length ? [] : args

  const cputilArgs = [command, ...args]

  console.log('cputilArgs', cputilArgs)

  const fullCommand = `${CPUTIL_PATH} ${cputilArgs.join(' ')}`

  console.log('fullCommand', fullCommand)

  return new Promise((resolve, reject) => {
    child_process.exec(fullCommand, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      }

      if (stderr) {
        return resolve(stderr)
      }

      return resolve(stdout)
    })
  })
}

function makeDir(path: string) {
  return checkIfDirAlreadyExists(path).then((exists) => {
    if (!exists) return createDir(path)
  })
}

function createDir(path: string) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (err) => {
      if (err) {
        return reject(err)
      }

      return resolve(null)
    })
  })
}

function checkIfDirAlreadyExists(path: string) {
  return new Promise((resolve) => {
    fs.access(path, (error) => {
      if (error) {
        return resolve(false)
      }

      return resolve(true)
    })
  })
}
