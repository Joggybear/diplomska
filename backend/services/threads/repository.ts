import {
    RecordSchema,
    HashRepository,
    RangeRepository
} from '../../dynamo';

import {
    ThreadItem,
    ThreadList,
    CommentItem,
    CommentList
} from '../../api';

const threadSchema: RecordSchema = {
    ThreadId: { S: { hash: true } },
    Title: { S: true },
    Content: { S: true },
    CommentCount: { N: true },
    Creator: { S: true },
    LastDate: { S: true },
    LastUser: { S: true },
    CreatorId: { S: true }
}

const commentSchema: RecordSchema = {
    CommentId: { S: { hash: true } },
    ThreadId: { S: { range: true } },
    Content: { S: true },
    Creator: { S: true },
    CreatorId: { S: true }
}

export class ThreadRepository extends HashRepository<ThreadItem, string> {
    constructor(stage: string) {
        super(stage, 'Thread', threadSchema);
    }

    public async query(query: Record<string, string>): Promise<ThreadList> {
        let queryIndexParams: any = {
            TableName: this.tableName
        }

        if (query && query.search) {
            queryIndexParams.FilterExpression = "contains(#title, :s) OR contains(#content, :s)"
            queryIndexParams.ExpressionAttributeNames = {
                "#title": "Title",
                "#content": "Content"
            }
            queryIndexParams.ExpressionAttributeValues = {
                ":s": { S: query.search }
            }
        }

        let queryRes = await this.db.scan(queryIndexParams).promise();
        let threads = queryRes.Items.map((item: any) => {
            let thread: ThreadItem = this.unmarshal(item);
            return thread;
        })

        threads.sort((a, b) => {
            return +new Date(a.created) - +new Date(b.created);
        });

        let result: ThreadList = {
            query,
            items: threads
        };

        return result;
    }
}

export class CommentRepository extends RangeRepository<CommentItem, string, string> {
    constructor(stage: string) {
        super(stage, "Comment", commentSchema);
    }

    public async listComments(threadId: string, debug?: boolean): Promise<CommentList> {

        let queryParams = {
            TableName: this.tableName,
            IndexName: "Thread-index",
            KeyConditionExpression: "ThreadId = :threadId",
            ScanIndexForward: true,
            ExpressionAttributeValues: { ":threadId": { S: threadId } }
        };

        let queryRes = await this.db.query(queryParams).promise();

        let comments = queryRes.Items.map((res: any) => {
            let comment: CommentItem = this.unmarshal(res);
            return comment;
        });

        comments.sort((a, b) => {
            return +new Date(a.created) - +new Date(b.created);
        });

        let result = {
            query: {
                threadId: threadId,
            },
            items: comments
        }

        return result;
    }
}