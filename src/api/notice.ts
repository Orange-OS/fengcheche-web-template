import request from '@/utils/axios'

export const noticeCount = () => {
  return request({
    url: '/leave/count',
    method: 'get',
    data: {},
  })
}
