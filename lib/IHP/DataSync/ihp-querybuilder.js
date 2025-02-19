function fetchAuthenticated(path, params) {
    const jwt = localStorage.getItem('ihp_jwt');
    if (jwt !== null) {
        params.headers['Authorization'] = 'Bearer ' + jwt;
    } else {
        params.credentials = 'include';
    }

    return fetch(ihpBackendUrl(path), params);
}

function ihpBackendUrl(path) {
    const host = window.ihpBackendHost || '';
    return host + path;
}

window.fetchAuthenticated = fetchAuthenticated;

class QueryBuilder {
    constructor(table) {
        // Maps to 'DynamicSQLQuery'
        this.query = {
            table,
            selectedColumns: { tag: 'SelectAll' },
            whereCondition: null,
            orderByClause: [],
            limitClause: null,
            offsetClause: null
        };
    }

    filterWhere(field, value) {
        this.query.whereCondition = { tag: 'VarCondition', contents: [field + ' = ?', value ] };

        return this;
    }

    orderBy(column) {
        return this.orderByAsc(column);
    }

    orderByAsc(column) {
        this.query.orderByClause.push({ orderByColumn: column, orderByDirection: 'Asc' });

        return this;
    }

    orderByDesc(column) {
        this.query.orderByClause.push({ orderByColumn: column, orderByDirection: 'Desc' });

        return this;
    }

    limit(limit) {
        this.query.limitClause = 'LIMIT ' + limit;

        return this;
    }

    offset(offset) {
        this.query.offsetClause = 'OFFSET ' + offset;

        return this;
    }

    async fetch() {
        // return fetch('/Query').then(response => response.json());
        const { result } = await DataSyncController.getInstance().sendMessage({ tag: 'DataSyncQuery', query: this.query });
        return result;
    }

    async fetchOne() {
        const result = await this.limit(1).fetch();
        return result.length > 0 ? result[0] : null;
    }

    async fetchAndRefresh(callback) {
        const dataSubscription = new DataSubscription(this.query);
        let records = null;

        dataSubscription.onReady = result => { records = result; callback(result) };
        dataSubscription.onUpdate = (id, changeSet) => {
            for (const record of records) {
                if (record.id === id) {
                    Object.assign(record, changeSet);
                    break;
                }
            }

            callback(records);
        }
        dataSubscription.onCreate = newRecord => {
            records.push(newRecord);
            callback(records);
        };
        dataSubscription.onDelete = id => {
            records = records.filter(record => record.id !== id);
            callback(records);
        };
    }
}

function query(table) {
    return new QueryBuilder(table);
}

export { QueryBuilder, query, ihpBackendUrl, fetchAuthenticated };