export const generatePlayerRows = (count: number): string => {
  let body = "";
  for (let i = 0; i < count; i++) {
    body += `
        <td>${i}</td>
        <td>
          <input type="checkbox" id="player${i}_cb" title="Check to include in camera view.">
        </td>
        <input id="player${i}_name" type="text" />
      `;
  }
  return body;
};
