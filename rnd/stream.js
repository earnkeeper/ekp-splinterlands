const dsteem = require('@hiveio/dhive');

let opts = {};

opts.addressPrefix = 'STM';
opts.chainId =
  'beeab0de00000000000000000000000000000000000000000000000000000000';

const client = new dsteem.Client('https://api.hive.blog');

let stream;

async function main() {
  stream = client.blockchain.getBlockStream();
  stream
    .on('data', function (block) {
      console.log(
        block.transactions
          .filter((t) => ['custom_json'].includes(t.operations[0][0]))
          .map((t) => t.operations[0][1]?.id),
      );
    })
    .on('end', function () {
      console.log('END');
    });
}
main().catch(console.error);
