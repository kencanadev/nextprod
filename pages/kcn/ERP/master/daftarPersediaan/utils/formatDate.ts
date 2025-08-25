export const formatDate = (date: Date, status: string) => {
  const year = date?.getFullYear();
  const month = String(date?.getMonth() + 1).padStart(2, '0');
  const day = String(date?.getDate()).padStart(2, '0');
  if (status === 'awal') {
    return `${year}-${month}-${day}`;
  }
  return `${day}-${month}-${year}`;
};
