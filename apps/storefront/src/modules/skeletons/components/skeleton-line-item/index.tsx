import { Table } from "@modules/common/components/ui"

const SkeletonLineItem = () => {
  return (
    <Table.Row className="w-full hover:bg-transparent">
      <Table.Cell className="!pl-0 py-3.5">
        <div className="flex items-center gap-x-3 sm:gap-x-3.5">
          <div className="w-14 sm:w-16 h-14 sm:h-16 shrink-0 bg-gray-200 rounded-md animate-pulse" />
          <div className="flex flex-col gap-y-2 min-w-0">
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </Table.Cell>
      <Table.Cell className="!pr-0 text-right align-middle">
        <div className="flex flex-col items-end gap-y-1 !pr-0">
          <div className="w-12 h-3.5 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

export default SkeletonLineItem
