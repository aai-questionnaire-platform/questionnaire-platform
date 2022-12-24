const { Component } = require('@serverless/core');

const envs = ['dev', 'test', 'prod'];

function assertEnv(env) {
  if (!envs.includes(env)) {
    throw new Error(
      `No environment "${env}". Choices are [${envs.join(', ')}]`
    );
  }
}

class Deploy extends Component {
  async default(inputs = {}) {
    const { stage } = inputs;

    assertEnv(stage);

    require('dotenv').config({ path: `${__dirname}/env.${stage}` });
    const template = await this.load('@serverless/template', stage);
    return template({ template: 'serverless.yml' });
  }

  async remove(inputs = {}) {
    const { stage } = inputs;

    assertEnv(stage);

    const template = await this.load('@serverless/template', stage);
    return template.remove();
  }
}

module.exports = Deploy;
