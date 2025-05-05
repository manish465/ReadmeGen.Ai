import express from 'express';
import request from 'supertest';
import { expect } from 'chai';
import sinon from 'sinon';

import {
    createRepoPrompt,
    createRepoPromptCompact,
    healthCheck,
} from '../../controllers/promptController';
import * as promptService from '../../service/promptService';

const app = express();
app.get('/repo-prompt', createRepoPrompt);
app.get('/repo-prompt-compact', createRepoPromptCompact);
app.get('/health', healthCheck);

describe('Prompt Controller (Mocha + Chai + Sinon)', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('healthCheck', () => {
        it('should return 200 with working message', async () => {
            const res = await request(app).get('/health');
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal({ message: 'Prompt Service is working' });
        });
    });

    describe('createRepoPrompt', () => {
        it('should return 400 if repo is missing', async () => {
            const res = await request(app).get('/repo-prompt');
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Missing repo data');
        });

        it('should return 400 if repo format is invalid', async () => {
            const res = await request(app).get('/repo-prompt?repo=invalidformat');
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Invalid repo format');
        });

        it('should return 200 and data from service', async () => {
            const mockData = {
                name: 'test-repo',
                description: 'A test repository',
                languages: 'TypeScript',
                license: 'MIT',
                isForked: false,
                stars: 100,
                topics: ['open-source', 'typescript'],
                fileContentList: ['README.md', 'index.ts'],
            };

            sinon.stub(promptService, 'createRepoPromptService').resolves(mockData as any);

            const res = await request(app).get('/repo-prompt?repo=owner/test-repo');
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal({ data: mockData });
        });

        it('should return error response from service failure', async () => {
            sinon.stub(promptService, 'createRepoPromptService').resolves({
                status: 404,
                message: 'Not Found',
            });

            const res = await request(app).get('/repo-prompt?repo=owner/test-repo');
            expect(res.status).to.equal(404);
            expect(res.body).to.deep.equal({ error: 'Not Found' });
        });
    });

    describe('createRepoPromptCompact', () => {
        it('should return 400 if repo is missing', async () => {
            const res = await request(app).get('/repo-prompt-compact');
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Missing repo data');
        });

        it('should return 400 if repo format is invalid', async () => {
            const res = await request(app).get('/repo-prompt-compact?repo=invalidformat');
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Invalid repo format');
        });

        it('should return 200 and compact prompt data', async () => {
            const mockData = 'Some formatted repo string';
            sinon.stub(promptService, 'createRepoPromptCompactService').resolves(mockData as any);

            const res = await request(app).get('/repo-prompt-compact?repo=owner/test-repo');
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal({ data: mockData });
        });

        it('should return error response from service failure', async () => {
            sinon.stub(promptService, 'createRepoPromptCompactService').resolves({
                status: 500,
                message: 'Internal Error',
            });

            const res = await request(app).get('/repo-prompt-compact?repo=owner/test-repo');
            expect(res.status).to.equal(500);
            expect(res.body).to.deep.equal({ error: 'Internal Error' });
        });
    });
});
