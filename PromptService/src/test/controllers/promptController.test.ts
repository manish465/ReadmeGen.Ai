import { expect } from 'chai';
import sinon from 'sinon';
import * as promptService from '../../service/promptService';
import {
    createRepoPrompt,
    createRepoPromptCompact,
    healthCheck,
} from '../../controllers/promptController';

describe('Repository Controller', () => {
    let req: any;
    let res: any;
    let statusStub: sinon.SinonStub;
    let sendStub: sinon.SinonStub;
    let serviceStub: sinon.SinonStub;
    let compactServiceStub: sinon.SinonStub;

    beforeEach(() => {
        sendStub = sinon.stub();
        statusStub = sinon.stub().returns({ send: sendStub });
        req = { body: {} };
        res = { status: statusStub };
        serviceStub = sinon.stub(promptService, 'createRepoPromptService');
        compactServiceStub = sinon.stub(promptService, 'createRepoPromptCompactService');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('healthCheck', () => {
        it('should return 200 status with working message', async () => {
            await healthCheck(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(sendStub.calledWith({ message: 'Prompt Service is working' })).to.be.true;
        });
    });

    describe('createRepoPrompt', () => {
        it('should return 400 when repo is missing', async () => {
            req.body = { inputFilePathList: [] };

            await createRepoPrompt(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(sendStub.calledWith({ error: 'Invalid or missing repo format' })).to.be.true;
        });

        it('should return 400 when repo format is invalid', async () => {
            req.body = { repo: 'invalid-format', inputFilePathList: [] };

            await createRepoPrompt(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(sendStub.calledWith({ error: 'Invalid or missing repo format' })).to.be.true;
        });

        it('should return service error when service returns error', async () => {
            req.body = { repo: 'owner/repo', inputFilePathList: [] };
            serviceStub.resolves({ status: 404, message: 'Repository not found' });

            await createRepoPrompt(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(sendStub.calledWith({ error: 'Repository not found' })).to.be.true;
        });

        it('should return 200 with data when service succeeds', async () => {
            req.body = { repo: 'owner/repo', inputFilePathList: [] };
            const responseData = { files: [], structure: {} };
            serviceStub.resolves(responseData);

            await createRepoPrompt(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(sendStub.calledWith({ data: responseData })).to.be.true;
            expect(serviceStub.calledWith('owner', 'repo', [])).to.be.true;
        });

        it('should return 500 when service throws exception', async () => {
            req.body = { repo: 'owner/repo', inputFilePathList: [] };
            serviceStub.throws(new Error('Service error'));

            await createRepoPrompt(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(sendStub.calledWith({ error: 'Internal server error' })).to.be.true;
        });

        it('should handle repo with multiple parts', async () => {
            req.body = { repo: 'github.com/owner/repo', inputFilePathList: [] };
            const responseData = { files: [], structure: {} };
            serviceStub.resolves(responseData);

            await createRepoPrompt(req, res);

            expect(serviceStub.calledWith('owner', 'repo', [])).to.be.true;
            expect(statusStub.calledWith(200)).to.be.true;
        });
    });

    describe('createRepoPromptCompact', () => {
        it('should return 400 when repo is missing', async () => {
            req.body = { inputFilePathList: [], customCommands: {} };

            await createRepoPromptCompact(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(sendStub.calledWith({ error: 'Invalid or missing repo format' })).to.be.true;
        });

        it('should return 400 when repo format is invalid', async () => {
            req.body = { repo: 'invalid-format', inputFilePathList: [], customCommands: {} };

            await createRepoPromptCompact(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(sendStub.calledWith({ error: 'Invalid or missing repo format' })).to.be.true;
        });

        it('should return service error when service returns error', async () => {
            req.body = { repo: 'owner/repo', inputFilePathList: [], customCommands: {} };
            compactServiceStub.resolves({ status: 404, message: 'Repository not found' });

            await createRepoPromptCompact(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(sendStub.calledWith({ error: 'Repository not found' })).to.be.true;
        });

        it('should return 200 with data when service succeeds', async () => {
            req.body = {
                repo: 'owner/repo',
                inputFilePathList: [],
                customCommands: { cmd: 'value' },
            };
            const responseData = { files: [], structure: {} };
            compactServiceStub.resolves(responseData);

            await createRepoPromptCompact(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(sendStub.calledWith({ data: responseData })).to.be.true;
            expect(compactServiceStub.calledWith('owner', 'repo', [], { cmd: 'value' })).to.be.true;
        });

        it('should return 500 when service throws exception', async () => {
            req.body = { repo: 'owner/repo', inputFilePathList: [], customCommands: {} };
            compactServiceStub.throws(new Error('Service error'));

            await createRepoPromptCompact(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(sendStub.calledWith({ error: 'Internal server error' })).to.be.true;
        });

        it('should handle repo with multiple parts', async () => {
            req.body = { repo: 'github.com/owner/repo', inputFilePathList: [], customCommands: {} };
            const responseData = { files: [], structure: {} };
            compactServiceStub.resolves(responseData);

            await createRepoPromptCompact(req, res);

            expect(compactServiceStub.calledWith('owner', 'repo', [], {})).to.be.true;
            expect(statusStub.calledWith(200)).to.be.true;
        });
    });
});
