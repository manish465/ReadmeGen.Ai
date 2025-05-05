import { Request, Response } from 'express';
import sinon from 'sinon';
import { expect } from 'chai';
import * as promptController from '../../controllers/promptController';
import { IFileContentList } from '../../types/github';
import { Octokit } from '@octokit/rest';

describe('testing createRepoPrompt controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusStub: sinon.SinonStub;
    let sendStub: sinon.SinonStub;

    beforeEach(() => {
        statusStub = sinon.stub();
        sendStub = sinon.stub();

        res = {
            status: statusStub.returnsThis(), // Allows chaining like res.status().send()
            send: sendStub,
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return 200 with proper data', async () => {
        // Arrange
        const dataSent = {
            repo: 'https://github.com/user/repo',
            filePaths: 'package.json',
        };

        const repoDataRecived: any = {
            data: {
                id: 123,
                node_id: 'node123',
                name: 'user/repo',
                full_name: 'user/repo',
                owner: {
                    login: 'user',
                    id: 1,
                    node_id: 'node1',
                    avatar_url: 'https://example.com/avatar',
                    gravatar_id: '',
                    url: 'https://api.github.com/users/user',
                    html_url: 'https://github.com/user',
                    followers_url: 'https://api.github.com/users/user/followers',
                    following_url: 'https://api.github.com/users/user/following{/other_user}',
                    gists_url: 'https://api.github.com/users/user/gists{/gist_id}',
                    starred_url: 'https://api.github.com/users/user/starred{/owner}{/repo}',
                    subscriptions_url: 'https://api.github.com/users/user/subscriptions',
                    repos_url: 'https://api.github.com/users/user/repos',
                    events_url: 'https://api.github.com/users/user/events{/privacy}',
                    received_events_url: 'https://api.github.com/users/user/received_events',
                    type: 'User',
                    site_admin: false,
                },
                private: false,
                description: 'description',
                fork: false,
                languages: 'javascript',
                license: {
                    key: 'mit',
                    name: 'MIT License',
                    spdx_id: 'MIT',
                    url: 'https://api.github.com/licenses/mit',
                    node_id: 'node123',
                },
                topics: ['react', 'JS'],
            },
            status: 200,
            headers: {},
            url: 'https://api.github.com/repos/user/repo',
        };

        const fileContentDataRecived: IFileContentList[] = [
            { path: 'package.json', content: 'file content' },
        ];

        req = {
            query: dataSent,
        };

        sinon.stub(promptController, 'fetchFilesContent').resolves(fileContentDataRecived);
        sinon.stub(promptController.octokit.repos, 'get').resolves(repoDataRecived);

        // Act
        await promptController.createRepoPrompt(req as Request, res as Response);

        expect(statusStub.calledWith(200)).to.be.true;
        expect(sendStub.called).to.be.true;
        const sentData = sendStub.getCall(0).args[0];

        expect(sentData.data.name).to.equal('user/repo');
        expect(sentData.data.fileContentList[0].content).to.equal('file content');
    });

    it('should handle Octokit error and return appropriate status and message', async () => {
        // Arrange
        req = {
            query: {
                repo: 'user/repo',
            },
        };

        sinon.stub(promptController, 'fetchFilesContent').resolves([]);

        sinon.stub(promptController.octokit.repos, 'get').rejects({
            error: {
                status: 403,
                response: {
                    data: {
                        message: 'API rate limit exceeded',
                    },
                },
            },
        });

        await promptController.createRepoPrompt(req as Request, res as Response);

        expect(statusStub.calledWith(403)).to.be.true;
        expect(sendStub.calledWithMatch({ error: 'API rate limit exceeded' })).to.be.true;
    });

    it('should return 400 if fetchFilesContent returns an error item', async () => {
        req = {
            query: {
                repo: 'user/repo',
                filePaths: 'README.md',
            },
        };

        sinon.stub(promptController, 'fetchFilesContent').resolves([
            {
                status: 400,
                errorMessage: 'Not found',
            },
        ]);

        const repoDataRecived: any = {
            data: {
                id: 123,
                node_id: 'node123',
                name: 'user/repo',
                full_name: 'user/repo',
                owner: {
                    login: 'user',
                    id: 1,
                    node_id: 'node1',
                    avatar_url: 'https://example.com/avatar',
                    gravatar_id: '',
                    url: 'https://api.github.com/users/user',
                    html_url: 'https://github.com/user',
                    followers_url: 'https://api.github.com/users/user/followers',
                    following_url: 'https://api.github.com/users/user/following{/other_user}',
                    gists_url: 'https://api.github.com/users/user/gists{/gist_id}',
                    starred_url: 'https://api.github.com/users/user/starred{/owner}{/repo}',
                    subscriptions_url: 'https://api.github.com/users/user/subscriptions',
                    repos_url: 'https://api.github.com/users/user/repos',
                    events_url: 'https://api.github.com/users/user/events{/privacy}',
                    received_events_url: 'https://api.github.com/users/user/received_events',
                    type: 'User',
                    site_admin: false,
                },
                private: false,
                description: 'description',
                fork: false,
                languages: 'javascript',
                license: {
                    key: 'mit',
                    name: 'MIT License',
                    spdx_id: 'MIT',
                    url: 'https://api.github.com/licenses/mit',
                    node_id: 'node123',
                },
                topics: ['react', 'JS'],
            },
            status: 200,
            headers: {},
            url: 'https://api.github.com/repos/user/repo',
        };

        sinon.stub(promptController.octokit.repos, 'get').resolves(repoDataRecived);

        await promptController.createRepoPrompt(req as Request, res as Response);

        expect(statusStub.calledWith(400)).to.be.true;
        expect(sendStub.calledWithMatch({ error: 'Error fetching file content' })).to.be.true;
    });

    it('should return 400 if repo is missing', async () => {
        req = { query: {} };

        await promptController.createRepoPrompt(req as Request, res as Response);

        expect(statusStub.calledWith(400)).to.be.true;
        expect(sendStub.calledWithMatch({ error: 'Missing repo data' })).to.be.true;
    });

    it('should return 400 if repo format is invalid', async () => {
        req = { query: { repo: 'badFormatRepo' } };

        await promptController.createRepoPrompt(req as Request, res as Response);

        expect(statusStub.calledWith(400)).to.be.true;
        expect(sendStub.calledWithMatch({ error: 'Invalid repo format' })).to.be.true;
    });
});
