import request from '@/utils/request';

// 用药记录分页接口参数类型
export interface MedicationRecordPageQuery {
  medicineName?: string
  startDate?: string,
  endDate?: string,
  pageNum: number    // 当前页码
  pageSize: number   // 每页条数
}

// 用药记录列表接口参数类型
export interface MedicationRecordListQuery {
  medicineName?: string
  startDate?: string
  endDate?: string
}

// 用药记录数据类型
export interface MedicationRecord {
  id?: string | number
  medicineName: string
  medicationTime: string
  notes?: string
}


/**
 * 获取用药记录列表（分页）
 */
export function getMedicationRecordPage(params: MedicationRecordPageQuery): Promise<PaginationResult<MedicationRecord>> {
  return request({
    url: '/life/medication-records',
    method: 'get',
    params,
  })
}

/**
 * 获取用药记录列表
 */
export function getMedicationRecordList(params: MedicationRecordListQuery) {
  return request({
    url: '/life/medication-records/list',
    method: 'get',
    params,
  })
}

/**
 * 获取用药记录详情
 */
export function getMedicationRecordDetail(id: string | number) {
  return request({
    url: `/life/medication-records/${id}`,
    method: 'get',
  })
}

/**
 * 新增用药记录
 */
export function addMedicationRecord(data: MedicationRecord) {
  return request({
    url: '/life/medication-records',
    method: 'post',
    data,
  })
}

/**
 * 更新用药记录
 */
export function updateMedicationRecord(data: MedicationRecord) {
  return request({
    url: `/life/medication-records/${data.id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除用药记录
 */
export function deleteMedicationRecord(id: string | number) {
  return request({
    url: `/life/medication-records/${id}`,
    method: 'delete',
  })
}
