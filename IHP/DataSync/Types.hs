module IHP.DataSync.Types where

import IHP.Prelude
import Data.Aeson
import IHP.QueryBuilder
import IHP.DataSync.DynamicQuery
import Data.HashMap.Strict (HashMap)

data DataSyncMessage
    = DataSyncQuery { query :: !DynamicSQLQuery, requestId :: !Int }
    | CreateDataSubscription { query :: !DynamicSQLQuery, requestId :: !Int }
    | DeleteDataSubscription { subscriptionId :: !UUID, requestId :: !Int }
    | CreateRecordMessage { table :: !Text, record :: HashMap Text Value, requestId :: !Int }
    | CreateRecordsMessage { table :: !Text, records :: [HashMap Text Value], requestId :: !Int }
    | UpdateRecordMessage { table :: !Text, id :: !UUID, patch :: !(HashMap Text Value), requestId :: !Int }
    | DeleteRecordMessage { table :: !Text, id :: !UUID, requestId :: !Int }
    deriving (Eq, Show)

data DataSyncResponse
    = DataSyncResult { result :: [[Field]], requestId :: !Int }
    | DataSyncError { requestId :: !Int, errorMessage :: !Text }
    | FailedToDecodeMessageError
    | DidCreateDataSubscription { requestId :: !Int, subscriptionId :: UUID, result :: [[Field]] }
    | DidDeleteDataSubscription { requestId :: !Int, subscriptionId :: UUID }
    | DidInsert { subscriptionId :: UUID, record :: [Field] }
    | DidUpdate { subscriptionId :: UUID, id :: UUID, changeSet :: Value }
    | DidDelete { subscriptionId :: UUID, id :: UUID }
    | DidCreateRecord { requestId :: !Int, record :: [Field] } -- ^ Response to 'CreateRecordMessage'
    | DidCreateRecords { requestId :: !Int, records :: [[Field]] } -- ^ Response to 'CreateRecordsMessage'
    | DidUpdateRecord { requestId :: !Int, record :: [Field] } -- ^ Response to 'UpdateRecordMessage'
    | DidDeleteRecord { requestId :: !Int }

data Subscription = Subscription { id :: UUID, tableWatcher :: Async () }
    deriving (Eq)

data DataSyncController
    = DataSyncController
    | DataSyncReady { subscriptions :: HashMap UUID Subscription }
    deriving (Eq)
