let nameColors = ['#8B8FAB', '#00CACB', '#FF8888', '#AB928B']
let professionalDict = {
  'NONE': '无',
  'PRIMARY': '医师',
  'MIDDLE': '主治医师',
  'VICESENIOR': '副主任医师',
  'SENIOR': '主任医师',
  'UNKNOWN': '未知'
}
let followStatus = [
  {
    key: '待评估',
    value: '0'
  },
  {
    key: '随访中',
    value: '1'
  },
  {
    key: '待随访',
    value: '2'
  },
  {
    key: '已完成',
    value: '3'
  }
]
let consultantStatus = [
  {
    key: '咨询中',
    value: '0'
  },
  {
    key: '已完成',
    value: '1'
  },
  {
    key: '已过期',
    value: '2'
  }
]
let ConsultantProgress = {
  '0': '待支付',
  '100': '新问题',
  '200': '待回复',
  '300': '等待追问',
  '500': '已完成',
  '600': '超时取消'
}
let AskProgress = {
  '0': '待支付',
  '100': '咨询中',
  '200': '咨询中',
  '300': '咨询中',
  '500': '已完成',
  '600': '超时取消'
}
let MessageType = {
  '0': 'TEXT',
  '1': 'IMAGE',
  '2': 'AUDIO',
  '3': 'EVENT',
  '4': 'TIP',
  '5': 'QUESTION'
}
let MessageEventDict = {
  'Start': [],
  'Complete': ['本次咨询已结束，感谢您的回复。'],
  'Expired': ['已超过24小时未回复，本次咨询已超时取消。']
}
let FamilyRelationsDict = [{
  key: '本人',
  value: 'Self'
}, {
  key: '配偶',
  value: 'Spouse'
}, {
  key: '儿子',
  value: 'Son'
}, {
  key: '女儿',
  value: 'Daughter'
}, {
  key: '父亲',
  value: 'Father'
}, {
  key: '母亲',
  value: 'Mother'
}, {
  key: '姐妹',
  value: 'Sister'
}, {
  key: '兄弟',
  value: 'Brother'
}, {
  key: '其他',
  value: 'Other'
}]
let ApponitmentStatus = [
  {
    key: '待预约',
    value: '0'
  }, {
    key: '已预约',
    value: '100'
  }, {
    key: '已签到',
    value: '200'
  }, {
    key: '已过期',
    value: '500'
  }
]
let UnitDict = {
  '0': '日',
  '10': '次'
}
let ServicePackageStatus = {
  '0': '待确认',
  '10': '已确认',
  '20': '进行中',
  '30': '已取消',
  '40': '已过期',
  '50': '已完成'
}
export default {
  nameColors,
  professionalDict,
  followStatus,
  consultantStatus,
  ConsultantProgress,
  MessageType,
  MessageEventDict,
  AskProgress,
  FamilyRelationsDict,
  ApponitmentStatus,
  UnitDict,
  ServicePackageStatus
}
