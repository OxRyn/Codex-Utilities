const pb = {
  le: "<:le:1149236008127316048>",
  me: "<:me:1149236004058845194>",
  re: "<:re:1149235999390564353>",
  lf: "<:lf:1149235994021867571>",
  mf: "<:mf:1149235989525561354>",
  rf: "<:rf:1149235985251569704>",
};

function formatResults(upvotes = [], downvotes = []) {
  const totalVotes = upvotes.length + downvotes.length;
  const progressBarLength = 14;
  const filledSquares =
    Math.round((upvotes.length / totalVotes) * progressBarLength) || 0;
  const emptySquares = progressBarLength - filledSquares || 0;

  if (!filledSquares && !emptySquares) {
    emptySquares = progressBarLength;
  }

  const upPercentage = (upvotes.length / totalVotes) * 100 || 0;
  const downPercentage = (downvotes.length / totalVotes) * 100 || 0;

  const progressBar =
    (filledSquares ? pb.lf : pb.le) +
    (pb.mf.repeat(filledSquares) + pb.me.repeat(emptySquares)) +
    (filledSquares === progressBarLength ? pb.rf : pb.re);

  const results = [];
  results.push(
    `👍🏻 ${upvotes.length} upvotes (${upPercentage.toFixed(1)}%) • 👎🏻 ${
      downvotes.length
    } downvotes (${downPercentage.toFixed(1)}%)`,
  );
  results.push(progressBar);

  return results.join("\n");
}

module.exports = formatResults;
