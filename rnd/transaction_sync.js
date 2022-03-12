const axios = require('axios');

(async () => {
  const fetch = async (block) => {
    const response = await axios.get(
      `https://api.steemmonsters.io/transactions/history?from_block=${block}&limit=1000&types=sm_battle,battle`,
    );

    console.log(response.data.length);
  };
  try {
    console.time('fetch');
    await Promise.all([
      fetch(62184814),
      //   fetch(32197482),
      //   fetch(32196482),
      //   fetch(32195482),
      //   fetch(32194482),
      //   fetch(32294482),
      //   fetch(32394482),
      //   fetch(32494482),
      //   fetch(32594482),
      //   fetch(42594482),
      //   fetch(42594482),
    ]);
    console.timeEnd('fetch');
  } catch (error) {
    console.error(error.message);
  }
})();
