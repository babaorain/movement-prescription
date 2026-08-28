import type { RegionId } from '../types'

export const regions: { id: RegionId; name: string; hint: string }[] = [
  { id: 'neck', name: '頸部', hint: '脖子、肩頸、頭痛、下顎' },
  { id: 'shoulder', name: '肩部', hint: '抬手痛、肩僵硬、肩前後痛' },
  { id: 'elbow-hand', name: '肘腕手', hint: '手肘、手腕、手指、手麻' },
  { id: 'spine', name: '胸腰背', hint: '腰痛、上背痛、坐骨神經痛' },
  { id: 'hip', name: '髖與骨盆', hint: '鼠蹊、臀部、大腿外側' },
  { id: 'knee', name: '膝', hint: '前膝痛、上下樓、內外側膝痛' },
  { id: 'foot-ankle', name: '足踝小腿', hint: '腳踝、腳跟、足底、前足' },
]

export const regionName = (id: RegionId) => regions.find((region) => region.id === id)?.name ?? ''
