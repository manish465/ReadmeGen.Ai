import { expect } from 'chai';
import sinon from 'sinon';
import { Octokit } from '@octokit/rest';
import * as service from '../../service/promptService';

describe('promptService', () => {
    let octokitStub: sinon.SinonStubbedInstance<Octokit>;

    beforeEach(() => {
        octokitStub = sinon.stub(service.octokit);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('fetchFilesContent', () => {
        it('should fetch and decode base64 content for valid files', async () => {
            octokitStub.rest = {
                repos: {
                    getContent: sinon.stub().resolves({
                        data: {
                            content: Buffer.from('console.log("hello")').toString('base64'),
                        },
                    }),
                },
            } as any;

            const result = await service.fetchFilesContent('owner', 'repo', ['index.js']);

            expect(result).to.deep.equal([{ path: 'index.js', content: 'console.log("hello")' }]);
        });

        it('should handle files without content properly', async () => {
            octokitStub.rest = {
                repos: {
                    getContent: sinon.stub().resolves({
                        data: { otherField: 'irrelevant' },
                    }),
                },
            } as any;

            const result = await service.fetchFilesContent('owner', 'repo', ['index.js']);

            expect(result).to.deep.equal([{ path: 'index.js', content: 'No data' }]);
        });

        it('should return error response on API failure', async () => {
            octokitStub.rest = {
                repos: {
                    getContent: sinon.stub().rejects({ error: { status: 400 } }),
                },
            } as any;

            const result = await service.fetchFilesContent('owner', 'repo', ['fail.js']);

            expect(result).to.deep.equal({
                status: 400,
                message: 'Somthing went wrong',
            });
        });
    });

    describe('createRepoPromptService', () => {
        it('should return full repo data with file content', async () => {
            const fileContentStub = sinon
                .stub(service, 'fetchFilesContent')
                .resolves([{ path: 'README.md', content: '# Hello' }]);

            octokitStub.repos = {
                get: sinon.stub().resolves({
                    data: {
                        name: 'test-repo',
                        description: 'desc',
                        fork: true,
                        license: { name: 'MIT' },
                        topics: ['topic1'],
                        language: 'TS',
                    },
                }),
            } as any;

            const result = await service.createRepoPromptService('owner', 'repo', ['README.md']);

            expect(result).to.deep.equal({
                name: 'test-repo',
                description: 'desc',
                isForked: true,
                license: 'MIT',
                topics: ['topic1'],
                languages: 'TS',
                fileContentList: [{ path: 'README.md', content: '# Hello' }],
            });

            fileContentStub.restore();
        });

        it('should return error if file content fetch fails', async () => {
            const fileContentStub = sinon
                .stub(service, 'fetchFilesContent')
                .resolves({ status: 500, message: 'API Down' });

            const result = await service.createRepoPromptService('owner', 'repo', ['fail.js']);
            expect(result).to.deep.equal({ status: 500, message: 'API Down' });

            fileContentStub.restore();
        });

        it('should return error if repo fetch fails', async () => {
            sinon
                .stub(service, 'fetchFilesContent')
                .resolves([{ path: 'index.js', content: 'data' }]);

            octokitStub.repos = {
                get: sinon.stub().rejects({ error: { status: 400 } }),
            } as any;

            const result = await service.createRepoPromptService('owner', 'repo', ['index.js']);

            expect(result).to.deep.equal({
                status: 400,
                message: 'Somthing went wrong',
            });
        });
    });

    describe('createRepoPromptCompactService', () => {
        it('should return formatted string if all goes well', async () => {
            const stub = sinon.stub(service, 'createRepoPromptService').resolves({
                name: 'test',
                description: 'desc',
                isForked: false,
                license: 'Apache',
                topics: ['node', 'test'],
                languages: 'JS',
                fileContentList: [
                    { path: 'a.js', content: 'console.log("a");' },
                    { path: 'b.js', content: 'console.log("b");' },
                ],
            });

            const result = await service.createRepoPromptCompactService(
                'owner',
                'repo',
                ['a.js'],
                ['npm install', 'npm test']
            );

            expect(result).to.be.a('string');
            expect(result).to.include('Name : test');
            expect(result).to.include('console.log("a");');
            expect(result).to.include('Custom Commands');
            expect(result).to.include('npm test');

            stub.restore();
        });

        it('should return error if underlying service fails', async () => {
            const stub = sinon
                .stub(service, 'createRepoPromptService')
                .resolves({ status: 500, message: 'Fail' });

            const result = await service.createRepoPromptCompactService('owner', 'repo', [], []);

            expect(result).to.deep.equal({ status: 500, message: 'Fail' });
            stub.restore();
        });
    });
});
