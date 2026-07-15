import { PRESETS } from '../data/presets'
import { PERSONALITIES_DNA } from '../data/personalities'
import { registerDNA } from './characterDNA'

export { getDNA, inferDNA } from './characterDNA'
export type { CharacterDNA, EmotionState, Traits, VerifiedQuote } from './characterDNA'

registerDNA(PRESETS)
registerDNA(PERSONALITIES_DNA)
