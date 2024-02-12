import { FC } from 'react';
import { FixedSizeList, ListChildComponentProps, ReactElementType } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

interface props {
    itemData?: any[]
    height: string | number
    width: string | number
    hasNextPage: boolean
    dataSize: number
    loadNextPage: () => void | Promise<void>
    component: ({index, style, data} : ListChildComponentProps) => JSX.Element | null
    itemSize?: number
    overScan? : number
    style?: React.CSSProperties
    outerElementType?: ReactElementType | undefined
}


const WindowList : FC<props> = ({
  itemData, outerElementType, height, width, 
  hasNextPage, dataSize, itemSize = 73, overScan = 3, style, 
  loadNextPage, component}) => {

    const itemCount = hasNextPage ? dataSize + 1 : dataSize as number
    const isItemLoaded = (index : number) => !hasNextPage || index < dataSize
 
    return  <InfiniteLoader
    isItemLoaded={isItemLoaded}
    itemCount={itemCount}
    loadMoreItems={loadNextPage}>
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          itemData={itemData}
          style={style}
          height={height ?? 0}
          itemCount={itemCount}
          overscanCount={overScan}
          itemSize={itemSize}
          onItemsRendered={onItemsRendered}
          ref={ref}
          width={width}
          outerElementType={outerElementType}
          
        >
          {component}
        </FixedSizeList>
      )}
  </InfiniteLoader>
 
}

export default (WindowList)