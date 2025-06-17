// 导出所有 API 模块
export * from './auth'
export * from './user'
export * from './system/role'
export * from './menu'
export * from './notice'

// 以下是注释掉的代码，可以删除或保留作为参考
// 上传文件
// export const uploadFile = (file: File) => {
//   const formData = new FormData();
//   formData.append('file', file);
//
//   return axios.post('/upload', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
// };

// 获取文件列表
// export const getFileList = () => {
//   return axios.get('/files');
// };

// 下载文件
// export const downloadFile = (fileId: string) => {
//   return axios.get(`/files/${fileId}`, { responseType: 'blob' });
// };
