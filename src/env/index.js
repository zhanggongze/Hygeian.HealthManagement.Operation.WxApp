import { developConfig } from './develop'
import { trialConfig } from './trial'
import { releaseConfig } from './release'

const env = __wxConfig.envVersion
let envConfigInfo
if (env === 'develop') {
  envConfigInfo = developConfig
} else if (env === 'trial') {
  envConfigInfo = trialConfig
} else {
  envConfigInfo = releaseConfig
}
export const envConfig = envConfigInfo
