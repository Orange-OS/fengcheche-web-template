import request from '@/utils/request';

// 心跳分页接口参数类型
export interface HeartbeatPageQuery {
  keywords?: string
  pageNum: number    // 当前页码
  pageSize: number   // 每页条数
}

/**
 * 获取心跳分页
 */
export function getHeartBeatPage(data: HeartbeatPageQuery) {
  return request({
    url: '/system/heartbeat/page',
    method: 'post',
    data,
  })
}
