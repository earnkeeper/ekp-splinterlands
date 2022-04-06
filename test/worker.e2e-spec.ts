import { Test, TestingModule } from '@nestjs/testing';
import { MODULE_DEF } from '../src/worker.module';

describe('WorkerApp (e2e)', () => {
  it('loads all modules', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule(
      MODULE_DEF,
    ).compile();

    const app = moduleFixture.createNestApplication();

    await app.init();
  });
});
